'use strict';

const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const MODULE_NAME = 'linagora.esn.unifiedinbox.linshare';

describe('The create attachment API: POST api/attachments', () => {
  let app, deployOptions, user, lib;
  const password = 'secret';

  beforeEach(function(done) {
    this.helpers.modules.initMidway(MODULE_NAME, err => {
      if (err) {
        return done(err);
      }
      expect(err).to.not.exist;
      const application = require(this.testEnv.backendPath + '/webserver/application')(this.helpers.modules.current.deps);
      const api = require(this.testEnv.backendPath + '/webserver/api')(this.helpers.modules.current.deps, this.helpers.modules.current.lib.lib);

      application.use(require('body-parser').json());
      application.use('/api', api);

      app = this.helpers.modules.getWebServer(application);
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
  });

  afterEach(function(done) {
    this.helpers.mongo.dropDatabase(err => {
      if (err) return done(err);
      this.testEnv.core.db.mongo.mongoose.connection.close(done);
    });
  });

  it('should respond 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'post', '/api/attachments', done);
  });

  it('should respond 400 when blobId is not provided', function(done) {
    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, loggedInAsUser) => {
      expect(err).to.not.exist;

      loggedInAsUser(request(app).post('/api/attachments'))
        .send({})
        .expect(400)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal({
            error: {
              code: 400,
              details: 'blobId is required',
              message: 'Bad Request'
            }
          });
          done();
      });
    });
  });

  it('should create attachment then respond 201 the created attachment', function(done) {
    const attachment = {
      blobId: '12345',
      documentId: '111',
      asyncTaskId: '222'
    };

    this.helpers.api.loginAsUser(app, user.emails[0], password, (err, loggedInAsUser) => {
      expect(err).to.not.exist;

      loggedInAsUser(request(app).post('/api/attachments'))
        .send(attachment)
        .expect(201)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.shallowDeepEqual(attachment);
          done();
        });
    });
  });

  it('should update attachment then respond 200 with the updated attachment if the attachment is already exist', function(done) {
    const attachment = {
      userId: user.id,
      blobId: 'blobId',
      asyncTaskId: 'asyncTaskId',
      documentId: 'documentId'
    };

    lib.attachment.create(attachment)
      .then(createdAttachment => {
        this.helpers.api.loginAsUser(app, user.emails[0], password, (err, loggedInAsUser) => {
          expect(err).to.not.exist;

          loggedInAsUser(request(app).post('/api/attachments'))
            .send({
              userId: user.id,
              blobId: 'blobId',
              asyncTaskId: 'newAsyncTaskId'
            })
            .expect(200)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body).to.shallowDeepEqual({
                id: createdAttachment.id,
                userId: user.id,
                blobId: 'blobId',
                documentId: null,
                asyncTaskId: 'newAsyncTaskId'
              });
              done();
            });
        });
      });
  });

  it('should update attachment with new documentId and asyncTaskId then respond 200 with the updated attachment if the attachment is already exist', function(done) {
    const attachment = {
      userId: user.id,
      blobId: '765',
      asyncTaskId: 'asyncTaskId',
      documentId: 'documentId'
    };

    lib.attachment.create(attachment)
      .then(createdAttachment => {
        this.helpers.api.loginAsUser(app, user.emails[0], password, (err, loggedInAsUser) => {
          expect(err).to.not.exist;

          loggedInAsUser(request(app).post('/api/attachments'))
            .send({
              userId: user.id,
              blobId: '765',
              asyncTaskId: 'newAsyncTaskId',
              documentId: 'newDocumentId'
            })
            .expect(200)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body).to.shallowDeepEqual({
                id: createdAttachment.id,
                userId: user.id,
                blobId: '765',
                documentId: 'newDocumentId',
                asyncTaskId: 'newAsyncTaskId'
              });
              done();
            });
        });
      });
  });
});

