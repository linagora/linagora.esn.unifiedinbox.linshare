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

  it('should respond 409 when blobId is duplicated', function(done) {
    const attachment = {
      userId: user.id,
      blobId: '12345'
    };

    lib.attachment.create(attachment)
      .then(() => {
        this.helpers.api.loginAsUser(app, user.emails[0], password, (err, loggedInAsUser) => {
          expect(err).to.not.exist;

          loggedInAsUser(request(app).post('/api/attachments'))
            .send({ blobId: attachment.blobId })
            .expect(409)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body).to.deep.equal({
                error: {
                  code: 409,
                  details: 'Attachment with this blobId is already created: 12345',
                  message: 'Conflict'
                }
              });
              done();
          });
        });
      })
      .catch(err => done(err || 'should resolve'));
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
});
