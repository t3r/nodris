'use strict;';
/*
This file is part of twillris - a ALLRIS to Twitter bridge
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

class NodrisCommittee {
  constructor( id ) {
    this.committeeId = id;
    this.members = [];
  }

  addMemberId( id ) {
    this.members.push( Number(id) );
  }

  hasMember( id ) {
    return this.members.indexOf( Number(id) ) >= 0;
  }
}

module.exports = NodrisCommittee;
