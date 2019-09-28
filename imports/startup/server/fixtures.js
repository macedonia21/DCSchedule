// Fill the DB with example data on startup

import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';
import moment from 'moment/moment';

Meteor.startup(() => {
  // code to run on server at startup
  // Initialize accounts
  if (Meteor.users.find().count() === 0) {
    // Create Admin account
    const adminId = Accounts.createUser({
      email: 'htuan@deloitte.com',
      password: '@nhTuan2184',
      profile: {
        firstName: 'Tuan',
        lastName: 'Hoang',
        vnName: 'Hoàng Vũ Anh Tuấn',
        entCode: 'VN1C',
        country: 'Vietnam',
        joinDate: new Date(),
        base: 'HCM',
        empType: 'Permanent',
        indicator: '',
        indAlignment: '',
        costCenter: 'TI:SAP Solutions',
        portfolios: 'Enterprise Technology and Performance',
        offering: 'SAP',
        posTitle: 'SC',
        jobLevel: 'SC',
        gender: 'M',
        _counsellorId: '',
        talents: ['ABAP'],
        fullName: 'Tuan Hoang',
        email: 'htuan@deloitte.com',
        hPW: 40,
      },
    });

    if (adminId) {
      Roles.addUsersToRoles(adminId, ['user', 'admin'], Roles.GLOBAL_GROUP);
    }
  }
});
