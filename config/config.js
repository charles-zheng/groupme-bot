exports.debug = process.env.DEBUG || false;

exports.bot_owner = {
  name: process.env.BOT_OWNER_NAME,
  id:   process.env.BOT_OWNER_ID //'30802922'
};

exports.bots = {
  ra: process.env.RA_BOT_ID,
  raw: process.env.RAW_BOT_ID,
  ral: process.env.RAL_BOT_ID,
  fo0: process.env.FO0_BOT_ID,
  ralv: process.env.RALV_BOT_ID,
  rar: process.env.RAR_BOT_ID,
  rabb: process.env.RABB_BOT_ID,
  bmc: process.env.BMC_BOT_ID
};

exports.delay_time = 1000;