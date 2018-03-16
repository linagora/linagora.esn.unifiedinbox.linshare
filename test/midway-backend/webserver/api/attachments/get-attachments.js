'use strict';

const q = require('q');
const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');
const MODULE_NAME = 'linagora.esn.unifiedinbox.linshare';

describe('The list attachments API: GET api/attachments', () => {
  let app, deployOptions, user1, user2, lib;
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
        user1 = models.users[0];
        user2 = models.users[1];
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
    this.helpers.api.requireLogin(app, 'get', '/api/attachments', done);
  });

  it('should respond empty array when there is no attachments', function(done) {
    this.helpers.api.loginAsUser(app, user1.emails[0], password, (err, loggedInAsUser) => {
      expect(err).to.not.exist;

      loggedInAsUser(request(app).get('/api/attachments'))
        .expect(200)
        .end((err, res) => {
          expect(err).to.not.exist;
          expect(res.body).to.deep.equal([]);
          done();
      });
    });
  });

  it('should respond an array of attachments of the logged in user', function(done) {
    const attachment1 = {
      userId: user1.id,
      blobId: '1'
    };
    const attachment2 = {
      userId: user2.id,
      blobId: '2'
    };

    q.all([
        lib.attachment.create(attachment1),
        lib.attachment.create(attachment2)
      ])
      .then(() => {
        this.helpers.api.loginAsUser(app, user1.emails[0], password, (err, loggedInAsUser) => {
          expect(err).to.not.exist;

          loggedInAsUser(request(app).get('/api/attachments'))
            .expect(200)
            .end((err, res) => {
              expect(err).to.not.exist;
              expect(res.body).to.shallowDeepEqual([attachment1]);
              done();
          });
        });
      })
      .catch(err => done(err || 'should resolve'));
  });

  describe('with blobId query', function() {
    it('should respond an array of attachments specified by blobId', function(done) {
      const attachment1 = {
        userId: user1.id,
        blobId: '1'
      };
      const attachment2 = {
        userId: user1.id,
        blobId: '2'
      };

      q.all([
          lib.attachment.create(attachment1),
          lib.attachment.create(attachment2)
        ])
        .then(() => {
          this.helpers.api.loginAsUser(app, user1.emails[0], password, (err, loggedInAsUser) => {
            expect(err).to.not.exist;

            loggedInAsUser(request(app).get(`/api/attachments?blobId=${attachment2.blobId}`))
              .expect(200)
              .end((err, res) => {
                expect(err).to.not.exist;
                expect(res.body).to.shallowDeepEqual([attachment2]);
                done();
            });
          });
        })
        .catch(err => done(err || 'should resolve'));
    });
  });
});
