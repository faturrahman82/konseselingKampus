const appointmentService = require('../services/appointment.service');

const createAppointment = async (req, res, next) => {
    try {
        const result = await appointmentService.createAppointment(req.user.userId, req.body);
        res.status(201).json({ success: true, message: 'Appointment booked.', data: result });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const result = await appointmentService.updateAppointmentStatus(
            req.user.userId,
            req.params.id,
            req.body
        );
        res.json({ success: true, message: 'Status updated.', data: result });
    } catch (error) {
        next(error);
    }
};

const getStudentAppointments = async (req, res, next) => {
    try {
        const result = await appointmentService.getStudentAppointments(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getCounselorAppointments = async (req, res, next) => {
    try {
        const result = await appointmentService.getCounselorAppointments(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const addClinicalNote = async (req, res, next) => {
    try {
        const result = await appointmentService.addClinicalNote(
            req.user.userId,
            req.params.id,
            req.body
        );
        res.status(201).json({ success: true, message: 'Clinical note added.', data: result });
    } catch (error) {
        next(error);
    }
};

const getMyStudents = async (req, res, next) => {
    try {
        const result = await appointmentService.getMyStudents(req.user.userId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const getStudentDetail = async (req, res, next) => {
    try {
        const result = await appointmentService.getStudentDetailForCounselor(req.user.userId, req.params.studentId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

const cancelMyAppointment = async (req, res, next) => {
    try {
        const result = await appointmentService.cancelAppointmentByStudent(req.user.userId, req.params.id);
        res.json({ success: true, message: 'Appointment cancelled successfully.', data: result });
    } catch (error) {
        next(error);
    }
};

const updateMeetingLink = async (req, res, next) => {
    try {
        const result = await appointmentService.updateMeetingLink(
            req.user.userId,
            req.params.id,
            req.body.meetingLink
        );
        res.json({ success: true, message: 'Meeting link updated.', data: result });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    createAppointment, 
    updateStatus, 
    getStudentAppointments, 
    getCounselorAppointments, 
    addClinicalNote, 
    getMyStudents, 
    getStudentDetail,
    cancelMyAppointment,
    updateMeetingLink
};
