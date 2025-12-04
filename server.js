// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ===== MEMBER DATA =====
// Replace the placeholder names and image URLs with your 5 members.
// Just change `name`, `photo`, `role`, `skills`, `bio`, `location`.

const members = [
  {
    id: 1,
    name: "Member One Name", // <- your member 1 name
    photo: "https://link-to-member1-image", // <- your member 1 image URL
    role: "President",
    skills: ["Leadership", "Community", "Public Speaking"],
    bio: "Leads the GDGC chapter and coordinates events with a focus on impact and inclusivity.",
    location: "City A",
  },
  {
    id: 2,
    name: "Member Two Name", // <- your member 2 name
    photo: "https://link-to-member2-image", // <- your member 2 image URL
    role: "Vice President",
    skills: ["Strategy", "Event Planning", "Networking"],
    bio: "Designs the long-term strategy for the club and helps bring industry speakers to campus.",
    location: "City B",
  },
  {
    id: 3,
    name: "Member Three Name", // <- your member 3 name
    photo: "https://link-to-member3-image", // <- your member 3 image URL
    role: "Technical Lead",
    skills: ["Full-Stack", "DevOps", "Cloud"],
    bio: "Builds and reviews technical projects, mentors members on full-stack web development.",
    location: "City C",
  },
  {
    id: 4,
    name: "Member Four Name", // <- your member 4 name
    photo: "https://link-to-member4-image", // <- your member 4 image URL
    role: "Design Lead",
    skills: ["UI/UX", "Figma", "Branding"],
    bio: "Crafts visual identity for GDGC, focusing on accessible and modern UI/UX for all projects.",
    location: "City D",
  },
  {
    id: 5,
    name: "Member Five Name", // <- your member 5 name
    photo: "https://link-to-member5-image", // <- your member 5 image URL
    role: "Community Manager",
    skills: ["Social Media", "Content", "Engagement"],
    bio: "Engages with the community on social platforms and manages collaborations and outreach.",
    location: "City E",
  },
];

// ===== ROUTES =====

// GET /members - list all members (with optional query filters)
app.get("/members", (req, res) => {
  const { search, role, skill, location } = req.query;
  let result = [...members];

  if (search) {
    const term = search.toLowerCase();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.bio.toLowerCase().includes(term)
    );
  }

  if (role) {
    result = result.filter((m) => m.role.toLowerCase() === role.toLowerCase());
  }

  if (skill) {
    const skillTerm = skill.toLowerCase();
    result = result.filter((m) =>
      m.skills.some((s) => s.toLowerCase().includes(skillTerm))
    );
  }

  if (location) {
    result = result.filter(
      (m) => m.location.toLowerCase() === location.toLowerCase()
    );
  }

  res.json(result);
});

// GET /members/:id - get one member by id
app.get("/members/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const member = members.find((m) => m.id === id);
  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }
  res.json(member);
});

app.get("/", (req, res) => {
  res.json({ message: "GDGC Member API is running" });
});

app.listen(PORT, () => {
  console.log(`GDGC backend running on http://localhost:${PORT}`);
});
