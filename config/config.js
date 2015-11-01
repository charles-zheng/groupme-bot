exports.debug = process.env.DEBUG || false;

exports.bot_owner = {
  name: 'fo0',
  id: '30802922'
};

exports.bots = {
  ra: process.env.RA_BOT_ID,
  raw: process.env.RAW_BOT_ID,
  ral: process.env.RAL_BOT_ID,
  fo0: process.env.FO0_BOT_ID,
  ral: process.env.RALV_BOT_ID
};

exports.delay_time = 1000;