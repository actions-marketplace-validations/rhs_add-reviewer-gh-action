const core = require("@actions/core");
const github = require("@actions/github");

/**
 * Adds reviewers to a pull request.
 *
 * Uses octokit to access GitHub Actions information to add a reviewer
 * or list of reviewers to the pull request the action executed on.
 *
 * @since 1.0.0
 */
function run() {
  try {
    const reviewers = core.getInput("reviewers");
    const teams = core.getInput("team_reviewers");
    const removeRequest = core.getInput("remove").toLowerCase() === "true";
    const prReviewers = reviewers.split(", ");
    const teamReviewers = teams.split(", ");
    const token = process.env["GITHUB_TOKEN"] || core.getInput("token");
    const octokit = new github.getOctokit(token);
    const context = github.context;

    if (context.payload.pull_request == null) {
      core.setFailed("No pull request found.");
      return;
    }

    const pullRequestNumber = context.payload.pull_request.number;
    const params = {
      ...context.repo,
      pull_number: pullRequestNumber,
      reviewers: prReviewers,
      team_reviewers: teamReviewers
    };

    var response
    if (removeRequest) {
      response = octokit.pulls.removeRequestedReviewers(params);
    } else {
      response = octokit.pulls.requestReviewers(params);
    }

    response.then(r=>{
      core.info(JSON.stringify(r))
    }).catch(e=>{
      core.setFailed(e.message);
    });

  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
