// Collection definition

import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

// define collection
const Projects = new Mongo.Collection('projects');

// define schema
const Schema = new SimpleSchema({
  _id: {
    type: String,
  },
  projectName: {
    type: String,
  },
  engagementCode: {
    type: String,
  },
  _pmId: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
  },
  remark: {
    type: String,
    optional: true,
  },
});

// attach schema
Projects.attachSchema(Schema);

export default Projects;
