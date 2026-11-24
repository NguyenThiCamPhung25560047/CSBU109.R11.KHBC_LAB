const { getCurrentWeather } = require('../services/weather.service');

exports.getWeather = async (req, res, next) => {
  try {
    const { city } = req.query;
    if (!city || !city.trim()) {
      return res.status(400).json({
        success: false,
        message: 'The city query parameter is required (Ví dụ: ?city=Hanoi)'
      });
    }

    const weather = await getCurrentWeather(city);
    return res.status(200).json({ success: true, data: weather });
  } catch (error) {
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return res.status(504).json({
        success: false,
        message: 'The weather service is taking too long to respond. Please try again in a moment.'
      });
    }
    const status = error.status || (error.response && error.response.status);
    if (status) {
      return res.status(status).json({
        success: false,
        message: error.message || 'External service error'
      });
    }
    next(error);
  }
};
