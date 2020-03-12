'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const ObjectId = require('mongoose').Types.ObjectId;

describe('The update attachment API: POST api/attachments/:attachmentId', () => {
  let app, deployOptions, user, lib;
  const password = 'secret';

  beforeEach(function(done) {
    app = this.helpers.modules.current.app;
    deployOptions = {
      fixtures: path.normalize(`${__dirname}/../../../fixtures/deployments`)
    };

    this.helpers.api.applyDomainDeployment('general', deployOptions, (err, models) => {
      if (err) {
        return done(err);
      }
      user = models.users[0];
      lib = this.helpers.modules.current.lib.lib;

      done();
    });
  });

  it('should respond 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'post', `/unifiedinboxlinshare/api/attachments/${new ObjectId()}`, done);
  });

  it('should respond 404 when attachment is not found', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, loggedInAsUser) => {
      expect(err).to.not.exist;

      loggedInAsUser(request(app).post(`/unifiedinboxlinshare/api/attachments/${new ObjectId()}`))
        .expect(404)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: {
              code: 404,
              details: 'Attachment not found',
              message: 'Not Found'
            }
          });
          done();
      });
    });
  });

  it('should respond 200 with the updated attachment on success', function(done) {
    const attachment = {
      userId: user.id,
      blobId: '1',
      asyncTaskId: '10jq'
    };
    const newDocumentId = '12345';
    const newAsyncTaskId = 'jqka';

    lib.attachment.create(attachment)
      .then(createdAttachment => {
        this.helpers.api.loginAsUser(app, user.emails[0], password, (err, loggedInAsUser) => {
          expect(err).to.not.exist;

          loggedInAsUser(request(app).post(`/unifiedinboxlinshare/api/attachments/${createdAttachment.id}`))
            .send({ documentId: newDocumentId, asyncTaskId: newAsyncTaskId })
            .expect(200)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body).to.shallowDeepEqual({
                id: createdAttachment.id,
                documentId: newDocumentId,
                asyncTaskId: newAsyncTaskId
              });
              done();
          });
        });
      });
  });
});
