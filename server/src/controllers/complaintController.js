const complaintService = require("../services/complaintService");

exports.create = async (req, res, next) => {
  try {
    const complaint = await complaintService.create(req.user.id, req.body);
    res.status(201).json(complaint);
  } catch (err) {
    next(err);
  }
};

exports.list = async (req, res, next) => {
  try {
    const complaints = await complaintService.list(req.user, req.query);
    res.json(complaints);
  } catch (err) {
    next(err);
  }
};

exports.getById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getById(req.user, req.params.id);
    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const complaint = await complaintService.update(
      req.user,
      req.params.id,
      req.body
    );
    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    await complaintService.remove(req.user, req.params.id);
    res.json({ message: "Complaint deleted" });
  } catch (err) {
    next(err);
  }
};

exports.assign = async (req, res, next) => {
  try {
    const complaint = await complaintService.assign(
      req.user,
      req.params.id,
      req.body.workerId
    );
    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const complaint = await complaintService.updateStatus(
      req.user,
      req.params.id,
      req.body.status,
      req.body.remark,
      req.body.proofImages
    );
    res.json(complaint);
  } catch (err) {
    next(err);
  }
};

exports.timeline = async (req, res, next) => {
  try {
    const history = await complaintService.timeline(req.params.id);
    res.json(history);
  } catch (err) {
    next(err);
  }
};
