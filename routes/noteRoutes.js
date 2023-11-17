const express = require('express');
const router = express.Router();
const notesController = require('../controllers/notesController.js');
const verifyJWT = require('../middleware/verifyJWT.js');

router.use(verifyJWT);

router
    .route('/')
    .get(notesController.getAllNotes)
    .post(notesController.createNewNote)
    .patch(notesController.updateNote)
    .delete(notesController.deleteNote);

module.exports = router;
