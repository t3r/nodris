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

class NodrisCalendarEntry {
  constructor( startDate, summary, description, location ) {
    this.startDate = startDate;
    this.summary = summary;
    this.location = location;
    this.link = null;
    this.setDescription( description );
  }

  setDescription( value ) {
    this.description = value;
    this.link = null;
    if( value ) {
      const idx = value.indexOf("https://");
      if( idx => 0 )
        this.link = value.substring(idx);
    }
  }

  static fromVevent( vevent ) {
    return new NodrisCalendarEntry(
      vevent.properties.DTSTART[0].value,
      vevent.properties.SUMMARY[0].value,
      vevent.properties.DESCRIPTION[0].value,
      vevent.properties.LOCATION[0].value );
  }

}

module.exports = NodrisCalendarEntry;
