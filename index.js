require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const axios = require("axios");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

const addDataToSheets = async (data) => {
  try {
    const jsonData = data;
    const response = await axios.post(
      "https://script.google.com/macros/s/AKfycbzhUuFj5sy5RFTOy__d7JYn3q3VjCE9rgp-KyuWTDd0wa2QMq7RdJJhLZ8N0UAZ_qs_Yg/exec",
      jsonData
    );
    console.log(response.data);
    const status = await response.status;
    if (status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error(error);
    return false;
  }
};

app.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      issue,
      ip,
      country,
      city,
      state,
      timezone,
      isp,
      ispOrganization,
      platform,
      browser,
      userAgent,
    } = await req.body;

    const emailMessage = `
          A new inquiry has been received:
    
          Name: ${name}
          Email: ${email}
          Phone: ${phone}
          Issue: ${issue}
          IP: ${ip}
          City: ${city}
          Country: ${country}
          State: ${state}
          Timezone: ${timezone}
          ISP: ${isp}
          ISP Organization: ${ispOrganization}
          Platform: ${platform}
          Browser: ${browser}
          User Agent: ${userAgent}
        `;

    const formData = new FormData();
    formData.append("Name", name);
    formData.append("Email", email);
    formData.append("Phone", phone);
    formData.append("Issue", issue);
    formData.append("IP", ip);
    formData.append("Country", country);
    formData.append("City", city);
    formData.append("State", state);
    formData.append("Timezone", timezone);
    formData.append("ISP", isp);
    formData.append("ISPOrganization", ispOrganization);
    formData.append("Platform", platform);
    formData.append("Browser", browser);
    formData.append("UserAgent", userAgent);

    const dataAdded = await addDataToSheets(formData);

    if (!dataAdded) {
      res.status(500).json({
        message: `Something went wrong. Please try again later.`,
      });
    }

    const mailTransporter = nodemailer.createTransport({
      service: process.env.EMAIL_HOST,
      auth: {
        user: process.env.EMAIL_HOST_USER,
        pass: process.env.EMAIL_HOST_PASSWORD,
      },
    });

    const mailDetails = {
      from: process.env.EMAIL_HOST_USER,
      to: process.env.RECIPIENT_ADDRESS,
      subject: `Ip Tracker Query`,
      text: emailMessage,
    };

    await mailTransporter.sendMail(mailDetails);
    res.status(200).json({
      message: `Thanks for reaching out!`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Something went wrong. Please try again later.`,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
