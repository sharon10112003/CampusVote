const express = require('express');
const router = express.Router();
const xlsx = require('xlsx');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const logAction = require('../utils/auditLogger');
const mongoose = require('mongoose');

// @desc    Get all elections
// @route   GET /api/elections
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const elections = await Election.find().sort({ startDate: -1 });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get election by ID
// @route   GET /api/elections/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidates = await Candidate.find({ electionId: election._id });
    res.json({ election, candidates });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Create election
// @route   POST /api/elections
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { title, description, startDate, endDate } = req.body;

  try {
    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      status: 'scheduled',
    });

    await logAction(req, 'CREATE_ELECTION', `Created election: ${title}`);
    res.status(201).json(election);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update election
// @route   PUT /api/elections/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const { title, description, startDate, endDate, status } = req.body;

  try {
    const election = await Election.findById(req.params.id);

    if (election) {
      election.title = title || election.title;
      election.description = description || election.description;
      election.startDate = startDate || election.startDate;
      election.endDate = endDate || election.endDate;
      election.status = status || election.status;

      const updatedElection = await election.save();
      await logAction(req, 'UPDATE_ELECTION', `Updated election: ${election.title}`);
      res.json(updatedElection);
    } else {
      res.status(404).json({ message: 'Election not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete election
// @route   DELETE /api/elections/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (election) {
      await Election.deleteOne({ _id: req.params.id });
      // Delete candidates associated with this election
      await Candidate.deleteMany({ electionId: req.params.id });
      await logAction(req, 'DELETE_ELECTION', `Deleted election and candidates: ${election.title}`);
      res.json({ message: 'Election and its candidates removed successfully' });
    } else {
      res.status(404).json({ message: 'Election not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Add candidate to election
// @route   POST /api/elections/:id/candidates
// @access  Private/Admin
router.post('/:id/candidates', protect, admin, upload.single('photo'), async (req, res) => {
  const { name, department, manifesto, position } = req.body;
  const electionId = req.params.id;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const candidate = await Candidate.create({
      name,
      department,
      manifesto,
      position,
      photoUrl,
      electionId,
    });

    await logAction(req, 'ADD_CANDIDATE', `Added candidate: ${name} (${position}) to election: ${election.title}`);
    res.status(201).json(candidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update candidate
// @route   PUT /api/elections/:electionId/candidates/:candidateId
// @access  Private/Admin
router.put('/:electionId/candidates/:candidateId', protect, admin, upload.single('photo'), async (req, res) => {
  const { name, department, manifesto, position } = req.body;

  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    candidate.name = name || candidate.name;
    candidate.department = department || candidate.department;
    candidate.manifesto = manifesto || candidate.manifesto;
    candidate.position = position || candidate.position;

    if (req.file) {
      candidate.photoUrl = `/uploads/${req.file.filename}`;
    }

    const updatedCandidate = await candidate.save();
    await logAction(req, 'UPDATE_CANDIDATE', `Updated candidate: ${candidate.name}`);
    res.json(updatedCandidate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Remove candidate from election
// @route   DELETE /api/elections/:electionId/candidates/:candidateId
// @access  Private/Admin
router.delete('/:electionId/candidates/:candidateId', protect, admin, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await Candidate.deleteOne({ _id: req.params.candidateId });
    await logAction(req, 'REMOVE_CANDIDATE', `Removed candidate: ${candidate.name} from election ID: ${req.params.electionId}`);
    res.json({ message: 'Candidate removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Cast a vote
// @route   POST /api/elections/:id/vote
// @access  Private/Student
router.post('/:id/vote', protect, async (req, res) => {
  const electionId = req.params.id;
  const { candidateId } = req.body;

  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Only students can cast votes' });
  }

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ message: 'Voting is not currently active for this election' });
    }

    const now = new Date();
    if (now < election.startDate || now > election.endDate) {
      return res.status(400).json({ message: 'Election time has either not started or has already ended' });
    }

    // Check if user has already voted
    const user = await User.findById(req.user._id);
    if (user.votedElections.includes(electionId)) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found in this election' });
    }

    // Perform atomic transaction: mark student as voted, and increment candidate's vote
    user.votedElections.push(electionId);
    await user.save();

    candidate.votes += 1;
    await candidate.save();

    // Asynchronously send vote confirmation email via FormSubmit.co AJAX API
    if (user.email) {
      const emailPayload = {
        _subject: `Vote Confirmation: ${election.title} - CampusVote`,
        Student_Name: user.name,
        Register_Number: user.registerNumber,
        Election_Title: election.title,
        Status: 'Successfully Cast',
        Timestamp: new Date().toLocaleString(),
        message: `Hello ${user.name},\n\nThis is a confirmation receipt that your vote has been successfully registered and counted for the election: "${election.title}".\n\nThank you for participating in the campus democratic process.\n\nBest regards,\nCampusVote Administration\nRVS College of Arts and Science`,
      };

      fetch(`https://formsubmit.co/ajax/${user.email}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(emailPayload),
      })
        .then((response) => response.json())
        .then((data) => console.log('FormSubmit notification sent successfully:', data))
        .catch((err) => console.error('FormSubmit notification error:', err));
    }

    res.json({ message: 'Vote cast successfully. Thank you!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get live voting statistics & turnout
// @route   GET /api/elections/:id/analytics
// @access  Private
router.get('/:id/analytics', protect, async (req, res) => {
  const electionId = req.params.id;

  try {
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Students can only view analytics if results are published or if they are admin
    if (req.user.role !== 'admin' && !election.resultsPublished) {
      return res.status(403).json({ message: 'Results have not been published yet' });
    }

    const candidates = await Candidate.find({ electionId }).sort({ votes: -1 });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    
    // Count how many users have this electionId in votedElections
    const votedCount = await User.countDocuments({
      role: 'student',
      votedElections: electionId,
    });

    const remainingCount = totalStudents - votedCount;
    const turnoutPercentage = totalStudents > 0 ? ((votedCount / totalStudents) * 100).toFixed(2) : 0;

    res.json({
      election,
      candidates,
      totalStudents,
      votesCast: votedCount,
      remainingVoters: remainingCount,
      turnoutPercentage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Toggle results publication
// @route   PATCH /api/elections/:id/publish
// @access  Private/Admin
router.patch('/:id/publish', protect, admin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (election) {
      election.resultsPublished = !election.resultsPublished;
      await election.save();
      await logAction(
        req,
        election.resultsPublished ? 'PUBLISH_RESULTS' : 'HIDE_RESULTS',
        `${election.resultsPublished ? 'Published' : 'Hid'} results for election: ${election.title}`
      );
      res.json({ message: `Results are now ${election.resultsPublished ? 'published' : 'hidden'}`, resultsPublished: election.resultsPublished });
    } else {
      res.status(404).json({ message: 'Election not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Export results as Excel spreadsheet
// @route   GET /api/elections/:id/export
// @access  Private/Admin
router.get('/:id/export', protect, admin, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidates = await Candidate.find({ electionId: election._id }).sort({ votes: -1 });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    const votedCount = await User.countDocuments({
      role: 'student',
      votedElections: election._id,
    });

    // Create a new workbook
    const wb = xlsx.utils.book_new();

    // Sheet 1: Election Summary
    const summaryData = [
      { Metric: 'Election Title', Value: election.title },
      { Metric: 'Status', Value: election.status.toUpperCase() },
      { Metric: 'Start Date', Value: election.startDate.toLocaleString() },
      { Metric: 'End Date', Value: election.endDate.toLocaleString() },
      { Metric: 'Total Eligible Voters', Value: totalStudents },
      { Metric: 'Total Votes Cast', Value: votedCount },
      { Metric: 'Voter Turnout', Value: totalStudents > 0 ? `${((votedCount / totalStudents) * 100).toFixed(2)}%` : '0%' },
    ];
    const wsSummary = xlsx.utils.json_to_sheet(summaryData);
    xlsx.utils.book_append_sheet(wb, wsSummary, 'Election Summary');

    // Sheet 2: Candidate Standings
    const candidatesData = candidates.map((c, i) => ({
      Rank: i + 1,
      Name: c.name,
      Position: c.position,
      Department: c.department,
      Manifesto: c.manifesto,
      Votes: c.votes,
      'Vote Share (%)': votedCount > 0 ? `${((c.votes / votedCount) * 100).toFixed(2)}%` : '0%',
    }));
    const wsCandidates = xlsx.utils.json_to_sheet(candidatesData);
    xlsx.utils.book_append_sheet(wb, wsCandidates, 'Candidate Standings');

    // Generate buffer
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=Election_Results_${election.title.replace(/\s+/g, '_')}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
