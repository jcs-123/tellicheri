import express from "express";
import PastoralCouncil from "../models/pastoralCouncil.js";

const router = express.Router();

// Fetch all grouped by category
router.get("/", async (req, res) => {
    try {
        const members = await PastoralCouncil.find().lean();
        const groupedData = {};

        members.forEach(member => {
            if (!groupedData[member.category]) groupedData[member.category] = [];
            groupedData[member.category].push({
                _id: member._id,
                name: member.name,
                designation: member.designation,
                address: member.address
            });
        });

        res.json(groupedData);
    } catch (error) {
        console.error("Error fetching pastoral council:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Fetch single member by ID
router.get("/:id", async (req, res) => {
    try {
        const member = await PastoralCouncil.findById(req.params.id);
        if (!member) {
            return res.status(404).json({ message: "Member not found" });
        }
        res.json(member);
    } catch (error) {
        console.error("Error fetching member:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Bulk insert (optional)
router.post("/bulk", async (req, res) => {
    try {
        const { data } = req.body;
        if (!data || typeof data !== "object") {
            return res.status(400).json({ message: "Invalid data format" });
        }

        await PastoralCouncil.deleteMany(); // optional reset
        const membersArray = [];

        // Convert grouped JSON to array of members
        Object.entries(data).forEach(([category, members]) => {
            members.forEach((m) => {
                membersArray.push({ ...m, category });
            });
        });

        await PastoralCouncil.insertMany(membersArray);
        res.status(201).json({ message: "Pastoral council saved successfully" });
    } catch (error) {
        console.error("Error saving pastoral council:", error);
        res.status(500).json({ message: "Server error" });
    }
});

export default router;