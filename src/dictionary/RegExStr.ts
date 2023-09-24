export const Regexs = {
  VTEC: new RegExp(
    /[OTEX].(NEW|CON|EXT|EXA|EXB|UPG|CAN|EXP|COR|ROU).\w{4}.[A-Z]{2}.[WAYSFON].\d{4}.\d{6}T\d{4}Z-\d{6}T\d{4}Z([^/]*\w{5}.[N0-3U].[A-Z]{2}.\d{6}T\d{4}Z.\d{6}T\d{4}Z.\d{6}T\d{4}Z.(NO|NR|UU|OO))?/g,
  ),
  ugc: new RegExp(/(\w{2}[CZ](\d{3}((-|>)\s?(\n\n)?))+)/gimu),
  ugcPiece: new RegExp(/(\w{2})([CZ])(\d{3})/g),
  ugcIndividual: new RegExp(/(\w{2})([CZ])(\d{3}(-|>))(.*?)(?=(\w{2})([CZ]))/g),
  SPC_Day: new RegExp(/(Day )([0-9]|[0-9]-[0-9])( Convective Outlook)/gi),
  SPC_Fire_Day: new RegExp(
    /(Day )([0-9]|[0-9]-[0-9])( Fire Weather Outlook)/gi,
  ),
  SPC_Time: new RegExp(/(Valid )[0-9]{6}(Z - )[0-9]{6}(Z)/gi),
  SPC_AOL_Time: new RegExp(/(VALID TIME )[0-9]{6}(Z - )[0-9]{6}(Z)/gi),
  SPC_type1: new RegExp(
    /[0-9][.][0-9]{2}|(TSTM|MRGL|SLGT|ENH|MDT|HIGH|SIGN|D4|D5|D6|D7|D8)/gi,
  ),
  SPC_type2: new RegExp(
    /[0-9][.][0-9]{2}|[TSTM]|[MRGL]|[SLGT]|[ENH]|[MDT]|[HIGH]|[SIGN]|D4|D5|D6|D7|D8/gi,
  ),
  date: new RegExp(/[0-9]{2}[/][0-9]{2}[/][0-9]{4}/g),
  threeDots: new RegExp(/[...]/g),
  Forecaster: new RegExp(/[.][.]\w*[/]\w*[.][.]|[.][.]\w*[.][.]/gi),
  timezone: new RegExp(/\d{3,4}\s[A|P]M\s(\w{3})\s/),
  magnitude: new RegExp(/([e|m])([\d|\.]+)\s(.+)/),
  AMPM: new RegExp(/[0-9]{4} (?:AM|PM)/g),
};
