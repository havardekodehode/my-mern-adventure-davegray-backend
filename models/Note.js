const mongoose = require('mongoose');
const AutoIncremenet = require('mongoose-sequence')(mongoose);

const noteSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        title: {
            type: String,
            required: true,
        },
        text: {
            type: String,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        created: {
            type: Date,
            default: true,
        },
        updated: {
            type: Date,
            default: true,
        },
        open: {
            type: Boolean,
            default: true,
        },

        ticketNr: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

noteSchema.plugin(AutoIncremenet, {
    inc_field: 'ticket',
    id: 'ticketNums',
    start_seq: 500,
});

module.exports = mongoose.model('Note', noteSchema);
