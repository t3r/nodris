'use strict;';
/*
This file is part of nodris - a ALLRIS to Node.js bridge
Copyright (C) 2019 Torsten Dreyer - torsten (at) t3r (dot) de

This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License along
with this program; if not, write to the Free Software Foundation, Inc.,
51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/
const got = require('got');
const iCal = require('icalendar');
const cheerio = require('cheerio'); const moment = require('moment-timezone');
const querystring = require('querystring');

const TWEET_PREFIX = process.env.TWEET_PREFIX || 'Sitzung #Wentorf: ';

const NodrisCalendarEntry = require('./NodrisCalendarEntry.js');
const NodrisAgendaEntry = require('./NodrisAgendaEntry.js');
const NodrisPerson = require('./NodrisPerson.js');

class Nodris {
  constructor( baseUrl ) {
    this.baseUrl = baseUrl;
  }
}

Nodris.prototype.getCalendar = function( startDate, endDate ) {
  endDate = endDate || startDate;

  if( typeof endDate === 'number' ) {
    endDate = moment(startDate).add( Number(endDate), 'days' ).toDate();
  }

  const d0 = ('00'+startDate.getUTCDate()).slice(-2) + '.' + ('00'+(startDate.getUTCMonth()+1)).slice(-2) + '.' + startDate.getUTCFullYear();
  const d1 = ('00'+endDate.getUTCDate()).slice(-2) + '.' + ('00'+(endDate.getUTCMonth()+1)).slice(-2) + '.' + endDate.getUTCFullYear();

  const query = new URLSearchParams([
    ['kaldatvonbis', d0 + '-' + d1 ],
    ['selfAction', 'Inhalte exportieren']
  ]);

  return got('si010_e.asp', {
    baseUrl: this.baseUrl,
    encoding: 'utf8',
    query
  })
  .then( response => {
    const reply = []
    let c = iCal.parse_calendar(response.body + '\r\n')
    if( c.components.VEVENT && c.components.VEVENT.forEach ) {
      c.components.VEVENT.forEach( vevent => {
        reply.push( NodrisCalendarEntry.fromVevent( vevent ) );
      });
    }
    return reply
  })
}

Nodris.prototype.getAgenda = function( options ) {
  if( typeof (options) === 'string' )
    options = { url: options }

  const query = new URLSearchParams([
    ['SILFDNR', options.siLfdNr  ],
  ]);

  const action = options.url ?
    got( options.url, {
      encoding: 'latin1'
    }) :
    got('to010.asp', {
      baseUrl: this.baseUrl,
      encoding: 'latin1',
      query
    });
  return action
  .then( response => {
    const $ = cheerio.load(response.body);
    const reply = []

    // fetch the link to the Ausschuss
    const $committee = $('td.kb1:contains("Gremium:")').siblings('td');
    reply.committeeId  = querystring.parse($committee.children('a').attr('href')).AULFDNR;
    reply.committee = $committee.text();

    const t = $("table.tl1 tr").each( (idx,element)=> {
      if( idx < 2 ) return;
      const td = $(element).children("td");
      if( td.length != 7 ) return;
      if( ! $(td[0]).text().trim().length ) return;
      reply.push( new NodrisAgendaEntry( $(td[0]).text(), $(td[3]).text() ));
    });
    return reply;
  })
}

Nodris.prototype.getPeople = function( options ) {
  const query = new URLSearchParams([
//    ['SILFDNR', options.siLfdNr  ],
  ]);

  return got('kp041.asp', {
    baseUrl: this.baseUrl,
    encoding: 'latin1',
    query
  })
  .then( response => {
    const $ = cheerio.load(response.body);
    const reply = []
    $("table.tl1").find("tr.zl11,tr.zl12").each( (idx,element)=> {
      const td = $(element).children("td");
      const person = {
        name: $(td[2]).text(),
        link: $(td[2]).children('a').attr('href'),
        origin: $(td[3]).text(),
      }
      if( person.link ) {
        person.allrisId = Number(person.link.split('=')[1]);
      }
      reply.push( person );
    });
    return reply;
  })
}

Nodris.prototype.getPerson = function( options ) {
  const query = new URLSearchParams([
    ['KPLFDNR', options.kpLfdNr  ],
  ]);

  const reply =  {}
  return got('kp020.asp', {
    baseUrl: this.baseUrl,
    encoding: 'latin1',
    query
  })
  .then( response => {
    const $ = cheerio.load(response.body);
    $('table.tl1').find("tr").each( (idx,element)=> {
      if( !$(element).hasClass('zw1') ) {
        const orga = $($(element).children('td')[1]).text();
        const role = $($(element).children('td')[2]).text();
        reply[orga] = role;
      }
    });
    return  {
      allrisId: options.kpLfdNr,
      details: reply,
    }
  })
}

Nodris.prototype.clearAgenda = function( agenda ) {
  const KillWords = /Einwohnerfragestunde|Niederschrift|Berichte|Anfragen|Anträge zur Tagesordnung|Eröffnung der Sitzung|Beschluss über den Ausschluss|Bekanntgabe der.*Beschlüsse|Bericht über die Ausführung/i

  return agenda.filter( entry => { 
    return !KillWords.test( entry.description ); 
  });

}

Nodris.prototype.ShrinkAgenda = function( agenda, maxLength ) {

  agenda = this.clearAgenda( agenda );

  function AgendaLength( agenda ) {
    let l = 0;
    agenda.forEach( e => {
      l += e.description.length
    });
    return l;
  }

  function ShrinkEntries( agenda, maxLength ) {
    if( AgendaLength( agenda ) < maxLength ) return agenda;

    let longest = 0;
    agenda.forEach( e => {
      longest = Math.max( e.description.length, longest );
    });
    agenda.forEach( e => {
      if( e.description.length >= longest )
        e.description = e.description.substring( 0, e.description.length-2 )+ '\u2026';
    });
    return ShrinkEntries( agenda, maxLength );
  }

  return ShrinkEntries( agenda, maxLength );
}

Nodris.prototype.makeShortTweet = function( calendarEntry ) {
  const status = `${TWEET_PREFIX}${moment(calendarEntry.startDate).tz('Europe/Berlin').format('D.M.YYYY HH:mm')} | ${calendarEntry.summary}, ${calendarEntry.location} (Tagesordnung: ${calendarEntry.link})`;
  return status;
}

Nodris.prototype.makeDetailedTweet = async function( calendarEntry ) {

  const TWEET_PREFIX = process.env.TWEET_PREFIX || 'Sitzung #Wentorf: ';
  let status = `${TWEET_PREFIX}${moment(calendarEntry.startDate).tz('Europe/Berlin').format('D.M.YYYY HH:mm')} | ${calendarEntry.summary} (`;

  let agenda = await this.getAgenda( calendarEntry.link );

  agenda = this.ShrinkAgenda( agenda, 278 - status.length - agenda.length*1 );
  let topics = [""];
  agenda.forEach( topic => {
    topics.push( topic.description );
  });

  status += topics.join('\u2023') + ')';

  return status;
}

Nodris.prototype.tweetCalendar = async function( options ) {
  options = options || {};
  options.startDate = options.startDate || new Date();
  options.dateRange = options.dateRange || 0;
  options.withDetails = options.withDetails || false;

  const calendar = await this.getCalendar( options.startDate, options.dateRange );
  calendar.forEach( async(calendarEntry) => {
    const mainResponse = await this.tweeter.tweet( { status: this.makeShortTweet(calendarEntry) } );
    if( options.withDetails ) {
      const agenda = await this.getAgenda( calendarEntry.link );
      const shortAgenda = this.clearAgenda( agenda );
      shortAgenda.forEach( async(top) => {
        const status = `@${mainResponse.data.user.screen_name} ${TWEET_PREFIX}|${top.topic}\u2023${top.description} ${calendarEntry.summary} `;
        const response = await this.tweeter.tweet( { status,  in_reply_to_status_id: mainResponse.data.id_str} );
        console.log(response.data);
      });
    }
  });
}

module.exports = Nodris;
