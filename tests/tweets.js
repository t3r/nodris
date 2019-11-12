'use strict'
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
const chai = require('chai');
const expect = require('chai').expect;
const assertArrays = require('chai-arrays');
chai.use(assertArrays);


module.exports = function() {
  const Nodris = require('../index').Nodris;

  it('should create simple tweets for a day', async function() {
    const sut = new Nodris('https://www.wentorf.sitzung-online.com/bi');
    let calendar = await sut.getCalendar( new Date('2019-09-30T10:00:00Z') );
    expect( calendar ).to.be.array();
    calendar.forEach( entry => {
      const tweet = sut.makeShortTweet( entry );
      expect( tweet ).to.be.a('string');
      // console.log(tweet);
    });

    return Promise.resolve();
  });

/*
  it('should create detailed tweets for a day', async function() {
    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    let calendar = await allris.getCalendar( new Date('2019-10-01T10:00:00Z') );
    expect( calendar ).to.be.array();
    calendar.forEach( async(entry) => {
      const tweet = await allris.makeDetailedTweet( entry );
      expect( tweet ).to.be.a('string');
      expect( tweet.length ).to.be.lt( 280 );
      console.log(tweet);
    });

    return Promise.resolve();
  });
*/
/*
  it('should tweet some entries', async function() {
    const allris = new Allris('https://www.wentorf.sitzung-online.com/bi');
    let id = 100000;
    allris.tweeter = {
      tweet: function(options) {
        console.log("Tweeting ", options );
        return Promise.resolve({  "id": id++, "user": { name: "GrueneWentorf"} });
      }
    };
    
    allris.tweetCalendar({
      startDate: new Date('2019-09-30T10:00:00Z'),
      dateRange: 1,
      withDetails: true,
    });

    return Promise.resolve();
  });
*/
}
