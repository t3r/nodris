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

function checkEntry( entry, length ) {
  expect(entry).to.be.array();
  expect(entry.length).to.equal(length);

  expect(entry[0]).to.have.property('topic');
  expect(entry[0].topic).to.be.a('string');

  expect(entry[0]).to.have.property('description');
  expect(entry[0].description).to.be.a('string');
}

module.exports = function() {
  const Nodris = require('../index').Nodris;

  it('should fetch all politicians', async function() {
    const sut = new Nodris('https://www.wentorf.sitzung-online.com/bi');
    let people = await sut.getPeople();
    // console.log(people);
    return Promise.resolve();
  });

  it('should fetch a politician by number (236)', async function() {
    const sut = new Nodris('https://www.wentorf.sitzung-online.com/bi');
    let person = await sut.getPerson({ kpLfdNr: 236 });
    // console.log(person);
    return Promise.resolve();
  });

}



