---
description: I need you to create an integration testing plan for $ARGUMENTS
category: code-analysis-testing
argument-hint: "Specify test plan or integration type"
examples:
  - "/testing_plan_integration payment gateway"
  - "/testing_plan_integration REST API and PostgreSQL database layer"
  - "/testing_plan_integration create an integration testing plan for the OAuth2 authorization flow between the Express backend and third-party identity provider, covering token exchange and refresh scenarios"
---

I need you to create an integration testing plan for $ARGUMENTS

These are integration tests and I want them to be inline in rust fashion.

If the code is difficult to test, you should suggest refactoring to make it easier to test.

Think really hard about the code, the tests, and the refactoring (if applicable).

Will you come up with test cases and let me review before you write the tests?

Feel free to ask clarifying questions.