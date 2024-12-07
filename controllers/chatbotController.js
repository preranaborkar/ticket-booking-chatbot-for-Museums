const eventModel = require('../models/eventModel');
const chatbotModel=require('../models/chatbotModel');
const nodemailer = require("nodemailer");
const crypto = require('crypto');  // To generate OTP
let otpStore = {}; 
const validator = require('validator');
require('dotenv').config();
const ticketController=require('../controllers/ticketController')

const email = process.env.EMAIL;
const emailPassword = process.env.EMAIL_PASSWORD;

// const userSessionData = req.session || {};
let userSessionData = {};
let tempTicketData = {};

exports.bookTicket = async (req, res) => {
    const intent = req.body.queryResult?.intent?.displayName; 
    const parameters = req.body.queryResult?.parameters;
    console.log("Received Intent: ", intent);


 try {
   switch(intent){
    case 'Cancel Ticket':
        console.log("cancel ticket intent");
        break;

  // Step 1: User provides the ticket ID
  case 'Provide TicketId':
      console.log("provide ticketid intent");
      const ticketId = parameters.ticketid;
      console.log("Received Ticket ID:", ticketId);

      // Validate if the ticket ID exists in the database
      const ticket = await chatbotModel.Ticket.findOne({ _id: ticketId });

      if (!ticket) {
          return res.json({
              fulfillmentText: `No ticket found with ID ${ticketId}. Please provide a valid ticket ID.`
          });
      }

      // Store the ticket temporarily for confirmation step
      tempTicketData = ticket;
      return res.json({
          fulfillmentText: `I found your ticket with ID ${ticketId}. Would you like to confirm the cancellation?`
      });
      break;
  // Step 2: User confirms cancellation
  case 'Confirm Cancel':
      
          console.log("cancle confirm");
          console.log(tempTicketData);
          const ticketdata = await chatbotModel.Ticket.findById(tempTicketData._id); 
          if (!ticketdata) {
            return res.json({
                fulfillmentText: `Ticket with ID ${tempTicketData._id} not found. Please try again.`
            });
        }
         
        ticketdata.status = 'cancelled';
          await ticketdata.save();
          console.log(ticketdata);
          console.log("Ticket cancelled successfully.");

          tempTicketData={};
          return res.json({
              fulfillmentText: `Your ticket with ID ${tempTicketData._id} has been successfully cancelled.`
          });
         

          break;

    case 'Provide Date':
        const today = new Date(); 
        const userDate = new Date(parameters.date); // Parse ISO 8601 string
        const formattedUserDate = userDate.toISOString().split('T')[0]; 
        const formattedToday=today.toISOString().split('T')[0];
            console.log("Stored Date:", formattedUserDate);

            if (userDate < today) {
                console.log("Invalid date provided (past date).");
        
                // Respond with an error message
                return res.json({
                    fulfillmentText: `The date you selected (${formattedUserDate}) is in the past or time has gone or There is no show available on this date. Please choose a date from today (${formattedToday}) onwards.`
                });
            }
            try {
            // Fetch events for the provided date
                const eventsOnDate = await eventModel.Event.find({ 
                        eventDate: {
                        $gte: new Date(`${formattedUserDate}T00:00:00Z`),
                        $lt: new Date(`${formattedUserDate}T23:59:59Z`)
                    } 
               });
               const availableEventNames = eventsOnDate.map(event => event.eventName).join(", ");
               userSessionData.bookingDate = formattedUserDate;

                if (eventsOnDate.length === 0) {
                        console.log(`No events found on ${formattedUserDate}`);
                        // No events found on the given date
                        return res.json({
                            fulfillmentText: `There are no events available on ${formattedUserDate}. Please try another date.`
                        });
                        
                }else{
                    return  res.json({
                        fulfillmentText: ` These events are available: ${availableEventNames} on the date ${formattedUserDate}.What is the name of the event you're attending?`
                    });
                }
              
               
                
        } catch (error) {
                console.error("Error fetching events:", error);
                res.sendStatus(500);
            }
            break;

    case 'Provide Showname':
        userSessionData.eventName = parameters.showname;
            console.log("Stored Show Name:", userSessionData.eventName);
            // Check if the event exists on the selected date
            const matchedEvent = await eventModel.Event.findOne({
                eventName: userSessionData.eventName,
                eventDate:userSessionData.bookingDate
            });
            if (!matchedEvent) {
                const availableEvents = await eventModel.Event.find({ eventDate: userSessionData.bookingDate });
                const availableEventNames = availableEvents.map(event => event.eventName).join(", ");
                return  res.json({
                    fulfillmentText: `The event "${ userSessionData.eventName}" is not available on ${ userSessionData.bookingDate}. However, these events are available: ${availableEventNames}.`
                });
               
            }
            userSessionData.eventId = matchedEvent._id; // Store event ID for later use
               
            break;

     case 'Provide NoOfTickets':
        userSessionData.quantity = parameters.noOfTicket;
            console.log("Stored No. of Tickets:", userSessionData.quantity);
            // Validate ticket quantity
            const eventForTickets = await eventModel.getEventById(userSessionData.eventId);
            console.log("Event ID being used to fetch event:", userSessionData.eventId);

            if (userSessionData.quantity > eventForTickets.capacity) {
                return res.json({
                    fulfillmentText: `Only ${eventForTickets.capacity} tickets are available for the event "${userSessionData.eventName}". Please provide a valid ticket quantity.`
                });
               
            }
            break;

    case 'Provide Name':
        userSessionData.name = parameters.name?.name || parameters.name;
            console.log("Stored Name:", userSessionData.name);
            break;

    case 'Provide Email':
                userSessionData.email = parameters.email;
                console.log("Stored Email:", userSessionData.email);

                // Validate the email format
                if (!validateEmail(userSessionData.email)) {
                    return res.json({
                        fulfillmentText: "The email you entered is invalid. Please enter a valid email address."
                    });
                }



                // Generate OTP and store it in otpStore
                const otp = generateOtp();
                const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes expiration time
                otpStore[userSessionData.email] = { otp, expirationTime };

                // Send OTP to the user's email
                await sendOtpEmail(userSessionData.email, otp);
                return res.json({
                    fulfillmentText: `An OTP has been sent to ${userSessionData.email}. Please enter the OTP to continue.`
                });
console.log("hi ");
          

    case 'Provide OTP':
        const providedOTP = parameters?.otp; // Safely access the OTP parameter
        console.log("Received OTP:", providedOTP); 

              // Check if OTP is valid
              if (otpStore[userSessionData.email]) {
                const { otp, expirationTime } = otpStore[userSessionData.email];

                if (Date.now() > expirationTime) {
                    console.log("OTP expired at:", expirationTime);
                    delete otpStore[userSessionData.email]; // OTP expired, delete it
                    return res.send({
                        fulfillmentText: "Your OTP has expired. Please request a new one."
                    });
                }
                console.log("otp generated "+otp);
                console.log("otp provided "+providedOTP);
                console.log("User's email during OTP validation:", userSessionData.email);
                console.log("Current Time:", Date.now());
                console.log("OTP Expiry Time:", otpStore[userSessionData.email]?.expirationTime);
                
                if (providedOTP.toString() === otp.toString()) {
                    console.log("OTP verified successfully.");
                    delete otpStore[userSessionData.email]; 
                    // Continue with the booking process (e.g., create user and ticket)
                    // await handleBooking();
                } else {
                    return res.json({
                        fulfillmentText: "Invalid OTP entered. Please try again."
                    });
                }
            } else {
                return res.json({
                    fulfillmentText: "No OTP found for this email. Please enter the email"
                });
            }

             break;
    case 'Confirmation':
        try {

                console.log("Received Confirmation intent.");
                // Ensure all necessary session data exists
                   if (!userSessionData.name || !userSessionData.email || !userSessionData.eventId || !userSessionData.quantity || !userSessionData.bookingDate) {
                       return res.json({
                       fulfillmentText: "Some booking details are missing. Please start the booking process again."
                     });
                   }

                   const event = await eventModel.getEventById(userSessionData.eventId);
                   event.capacity -= userSessionData.quantity;
                   await event.save();

                   // Check if user exists or create a new user
        let user = await chatbotModel.User.findOne({ email: userSessionData.email });
        if (!user) {
            user = await chatbotModel.createUser(userSessionData.name, userSessionData.email); 
        }



         // Generate a QR code (can be customized to any logic)
         const qrCode = crypto.randomBytes(8).toString('hex'); // A unique 16-character string
       // Create the ticket in the database
          const ticket = await chatbotModel.createTicket(
               user._id,
               userSessionData.eventId,
               userSessionData.quantity,
               new Date(userSessionData.bookingDate),
               qrCode
            );

            console.log("Ticket successfully created:", ticket);

             // Fetch the event details to include in the PDF
        const eventData = await eventModel.Event.findById(userSessionData.eventId);
        // Generate the PDF
        const pdfFilePath = await ticketController.generateTicketPDF(user, eventData, ticket);
          // Send the PDF via email
           await ticketController.sendEmailWithAttachment(userSessionData.email, pdfFilePath);

        // Respond with a confirmation message
        return res.json({
            fulfillmentText: `Thank you for confirming, ${userSessionData.name}. Your booking for the event "${userSessionData.eventName}" on ${userSessionData.bookingDate} has been confirmed. Your booking ID is ${ticket._id}. You will find the QR code in your email for easy access.`
        });

    } catch (error) {
        console.error("Error during booking confirmation:", error);
        return res.json({
            fulfillmentText: "An error occurred while processing your booking. Please try again."
        });
    }
             

    
    // default:
    //     console.log("No matching intent found.");
    //          break;
    
   }
   // Send an empty response back to Dialogflow
   res.sendStatus(200);
}catch (error) {
    console.error("Error handling intent:", error);
    res.sendStatus(500);
}
};



// Function to validate email format
const validateEmail = (email) => {
    return validator.isEmail(email);  // Checks for valid email
};

// Function to generate a 6-digit OTP
const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString(); // Generate OTP between 100000 and 999999
};

// Function to send OTP email
const sendOtpEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL, // Use the email from environment variables
            pass: process.env.EMAIL_PASSWORD // Use the password from environment variables
        }
    });
    
    const info = await transporter.sendMail({
        from: `"Shourya 👻" <${process.env.EMAIL}>`, 
        to: email, 
        subject: "OTP for Ticket Booking", 
        text: `Your OTP is ${otp}. This OTP is valid for 5 minutes.`, // Plain text body
        html: `<b>Your OTP is ${otp}</b><br><p>This OTP is valid for 5 minutes.</p>`, // HTML body
    });

    console.log("Message sent: %s", info.messageId);
};
           
