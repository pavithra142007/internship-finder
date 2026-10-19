const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/internships", async (req, res) => {
  try {
    const search = req.query.search || "software";
    const location = req.query.location || "India";
    const apiKey = process.env.RAPIDAPI_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "RAPIDAPI_KEY missing in .env"
      });
    }

    const url =
      "https://jsearch.p.rapidapi.com/search-v2?query=" +
      encodeURIComponent(`${search} internship in ${location}`) +
      "&page=1&num_pages=1&country=in&date_posted=all";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: result.message || "JSearch API request failed"
      });
    }

    const jobs = result.data?.jobs || [];

    res.json(jobs.map(job => ({
      title: job.job_title || "Internship",
      company: job.employer_name || "Company not listed",
      location: job.job_location || location,
      field: search,
      skills: Array.isArray(job.job_required_skills)
        ? job.job_required_skills.join(", ")
        : "",
      applyUrl: job.job_apply_link || ""
    })));

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);
});