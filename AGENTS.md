# Repository workflow

- All changes must go through a GitHub pull request targeting `main`, including small fixes and documentation changes.
- Before editing, create or switch to a feature branch. Use the `codex/` prefix for agent-created branches.
- Never commit directly to `main`, push directly to `main`, or bypass branch protection with administrator privileges.
- If unpublished commits are found on local `main`, preserve them on a feature branch and open a PR; do not push them to `main`.
- Run the checks appropriate to the change before opening the PR. The `Automated Test Suite` GitHub check must pass, and the branch must be up to date with `main`, before merging.
- Push the feature branch and open a PR with a concise description of the change and its validation. Merge only when the user requests it and all required checks pass; never use an admin override.
- Do not disable or weaken branch protection to complete a task. Report a blocking check or permission issue instead.
- Use `Arrel Gray <arrel@arrelgray.com>` for the Git author and committer identity (GitHub account: `arrel`). Verify the identity before committing; do not use an automatically inferred machine-local email.

# Local question review

- `/review` shows the complete question bank with answer choices, correct answers, and explanations.
- Keep this page restricted to development on localhost. Production and non-local hosts must return 404.
