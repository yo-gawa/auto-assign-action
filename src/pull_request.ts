import * as github from '@actions/github'
import * as core from '@actions/core'
import { Context } from '@actions/github/lib/context'

export class PullRequest {
  private client: github.GitHub
  private context: Context

  constructor(client: github.GitHub, context: Context) {
    this.client = client
    this.context = context
  }

  async addReviewers(_reviewers: string[]): Promise<void> {
    core.info(`addReviewers`)
    const { owner, repo, number: pull_number } = this.context.issue
    let reviewers: string[] = []
    let team_reviewers: string[] = []
    for (const reviewer of _reviewers) {
      if (reviewer.startsWith('@')) {
        team_reviewers.push(reviewer.substring(1))
      } else {
        reviewers.push(reviewer)
      }
    }
    core.info(`addReviewers reviewers to PR : ${reviewers.join(', ')}`)
    core.info(
      `addReviewers team_reviewers to PR : ${team_reviewers.join(', ')}`
    )
    const result = await this.client.pulls.createReviewRequest({
      owner,
      repo,
      pull_number,
      reviewers,
      team_reviewers,
    })
    core.debug(JSON.stringify(result))
  }

  async addAssignees(assignees: string[]): Promise<void> {
    const { owner, repo, number: issue_number } = this.context.issue
    const result = await this.client.issues.addAssignees({
      owner,
      repo,
      issue_number,
      assignees,
    })
    core.debug(JSON.stringify(result))
  }

  hasAnyLabel(labels: string[]): boolean {
    if (!this.context.payload.pull_request) {
      return false
    }
    const { labels: pullRequestLabels = [] } = this.context.payload.pull_request
    return pullRequestLabels.some(label => labels.includes(label.name))
  }
}
