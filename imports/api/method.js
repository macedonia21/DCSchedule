import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { check, Match } from 'meteor/check';

import Projects from './projects/projects.js';

if (Meteor.isServer) {
  Meteor.methods({
    'employee.create'(email, password, profile) {
      check(email, String);
      check(password, String);
      check(profile, {
        firstName: String,
        lastName: String,
        vnName: String,
        entCode: String,
        country: String,
        joinDate: Date,
        base: String,
        empType: String,
        indicator: String,
        indAlignment: String,
        costCenter: String,
        portfolios: String,
        offering: String,
        posTitle: String,
        jobLevel: String,
        gender: String,
        talents: Match.Maybe([String]),
        hPW: Number,
        _counsellorId: String,
      });

      try {
        Accounts.createUser({
          email,
          password,
          profile,
        });
      } catch (e) {
        throw new Meteor.Error(e.message);
      }
    },
    'employee.update'(_id, profile) {
      check(_id, String);
      check(profile, {
        firstName: String,
        lastName: String,
        fullName: String,
        vnName: String,
        entCode: String,
        country: String,
        joinDate: Date,
        base: String,
        empType: String,
        indicator: String,
        indAlignment: String,
        costCenter: String,
        portfolios: String,
        offering: String,
        posTitle: String,
        jobLevel: String,
        gender: String,
        talents: Match.Maybe([String]),
        email: String,
        hPW: Number,
        _counsellorId: String,
      });

      try {
        Meteor.users.update(
          { _id },
          {
            $set: {
              'profile.firstName': profile.firstName,
              'profile.lastName': profile.lastName,
              'profile.fullName': `${profile.firstName} ${profile.lastName}`,
              'profile.vnName': profile.vnName,
              'profile.entCode': profile.entCode,
              'profile.country': profile.country,
              'profile.joinDate': profile.joinDate,
              'profile.base': profile.base,
              'profile.empType': profile.empType,
              'profile.costCenter': profile.costCenter,
              'profile.portfolios': profile.portfolios,
              'profile.offering': profile.offering,
              'profile.posTitle': profile.posTitle,
              'profile.jobLevel': profile.jobLevel,
              'profile.gender': profile.gender,
              'profile.talents': profile.talents,
              'profile.hPW': profile.hPW,
            },
          }
        );
      } catch (e) {
        throw new Meteor.Error(e.message);
      }
    },
    'project.create'(project) {
      check(project, {
        projectName: String,
        engagementCode: String,
        _pmId: String,
        startDate: Date,
        endDate: Date,
        status: String,
        remark: String,
      });

      try {
        Projects.insert(project);
      } catch (e) {
        throw new Meteor.Error(e.message);
      }
    },
    'project.update'(_id, project) {
      check(_id, String);
      check(project, {
        _id: String,
        projectName: String,
        engagementCode: String,
        _pmId: String,
        startDate: Date,
        endDate: Date,
        status: String,
        remark: Match.Maybe(String),
      });

      try {
        Projects.update(
          { _id },
          {
            $set: {
              projectName: project.projectName,
              engagementCode: project.engagementCode,
              _pmId: project._pmId,
              startDate: project.startDate,
              endDate: project.endDate,
              status: project.status,
              remark: project.remark,
            },
          }
        );
      } catch (e) {
        throw new Meteor.Error(e.message);
      }
    },
  });
}
