const analyticsService = require("../services/analyticsService");

exports.stats = async (req, res, next) => {
  try {
    const data = await analyticsService.stats(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.monthlyTrend = async (req, res, next) => {
  try {
    const data = await analyticsService.monthlyTrend(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.departmentDistribution = async (req, res, next) => {
  try {
    const data = await analyticsService.departmentDistribution(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.statusDistribution = async (req, res, next) => {
  try {
    const data = await analyticsService.statusDistribution(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.priorityDistribution = async (req, res, next) => {
  try {
    const data = await analyticsService.priorityDistribution(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.areaTrend = async (req, res, next) => {
  try {
    const data = await analyticsService.areaTrend(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.workerPerformance = async (req, res, next) => {
  try {
    const data = await analyticsService.workerPerformance(req.user);
    res.json(data);
  } catch (err) {
    next(err);
  }
};
