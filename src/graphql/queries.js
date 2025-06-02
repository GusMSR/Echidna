/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      elo
      activeTrainingCycleID
      activeTrainingCycle {
        id
        startDate
        endDate
        goals
        createdAt
        updatedAt
        owner
        __typename
      }
      lichessUsername
      chesscomUsername
      completedAchievementsIDs
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        elo
        activeTrainingCycleID
        lichessUsername
        chesscomUsername
        completedAchievementsIDs
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getTrainingCycle = /* GraphQL */ `
  query GetTrainingCycle($id: ID!) {
    getTrainingCycle(id: $id) {
      id
      startDate
      endDate
      goals
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listTrainingCycles = /* GraphQL */ `
  query ListTrainingCycles(
    $filter: ModelTrainingCycleFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTrainingCycles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        startDate
        endDate
        goals
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getEvent = /* GraphQL */ `
  query GetEvent($id: ID!) {
    getEvent(id: $id) {
      id
      TrainingCycleID
      TrainingCycle {
        id
        startDate
        endDate
        goals
        createdAt
        updatedAt
        owner
        __typename
      }
      date
      studyType
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listEvents = /* GraphQL */ `
  query ListEvents(
    $filter: ModelEventFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listEvents(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        TrainingCycleID
        date
        studyType
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getGame = /* GraphQL */ `
  query GetGame($id: ID!) {
    getGame(id: $id) {
      id
      pgn
      platform
      date
      result
      rating
      userColor
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listGames = /* GraphQL */ `
  query ListGames(
    $filter: ModelGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGames(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        pgn
        platform
        date
        result
        rating
        userColor
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAnalysis = /* GraphQL */ `
  query GetAnalysis($id: ID!) {
    getAnalysis(id: $id) {
      id
      gameID
      game {
        id
        pgn
        platform
        date
        result
        rating
        userColor
        createdAt
        updatedAt
        owner
        __typename
      }
      userID
      user {
        id
        elo
        activeTrainingCycleID
        lichessUsername
        chesscomUsername
        completedAchievementsIDs
        createdAt
        updatedAt
        owner
        __typename
      }
      evaluatedPositions
      accuracy
      aiCommentary
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listAnalyses = /* GraphQL */ `
  query ListAnalyses(
    $filter: ModelAnalysisFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAnalyses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        gameID
        userID
        evaluatedPositions
        accuracy
        aiCommentary
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getSampleGame = /* GraphQL */ `
  query GetSampleGame($id: ID!) {
    getSampleGame(id: $id) {
      id
      result
      rating
      evaluatedPositions
      accuracy
      aiCommentary
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listSampleGames = /* GraphQL */ `
  query ListSampleGames(
    $filter: ModelSampleGameFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listSampleGames(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        result
        rating
        evaluatedPositions
        accuracy
        aiCommentary
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getAchievement = /* GraphQL */ `
  query GetAchievement($id: ID!) {
    getAchievement(id: $id) {
      id
      title
      description
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listAchievements = /* GraphQL */ `
  query ListAchievements(
    $filter: ModelAchievementFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listAchievements(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        description
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const getQuiz = /* GraphQL */ `
  query GetQuiz($id: ID!) {
    getQuiz(id: $id) {
      id
      question
      options
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listQuizzes = /* GraphQL */ `
  query ListQuizzes(
    $filter: ModelQuizFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listQuizzes(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        question
        options
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
