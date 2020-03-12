'use strict';

const q = require('q');
const request = require('supertest');
const expect = require('chai').expect;
const path = require('path');

describe('The list attachments API: GET api/attachments', () => {
  let app, deployOptions, user1, user2, lib;
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
      user1 = models.users[0];
      user2 = models.users[1];
      lib = this.helpers.modules.current.lib.lib;

      done();
    });
  });

  it('should respond 401 if not logged in', function(done) {
    this.helpers.api.requireLogin(app, 'get', '/unifiedinboxlinshare/api/attachments', done);
  });

  it('should respond empty array when there is no attachments', function(done) {
    this.helpers.api.loginAsUser(app, user1.emails[0], password, (err, loggedInAsUser) => {
      expect(err).to.not.exist;

      loggedInAsUser(request(app).get('/unifiedinboxlinshare/api/attachments'))
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

          loggedInAsUser(request(app).get('/unifiedinboxlinshare/api/attachments'))
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

            loggedInAsUser(request(app).get(`/unifiedinboxlinshare/api/attachments?blobId=${attachment2.blobId}`))
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
