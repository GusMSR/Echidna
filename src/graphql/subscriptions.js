/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onCreateUser(filter: $filter, owner: $owner) {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onUpdateUser(filter: $filter, owner: $owner) {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser(
    $filter: ModelSubscriptionUserFilterInput
    $owner: String
  ) {
    onDeleteUser(filter: $filter, owner: $owner) {
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
export const onCreateTrainingCycle = /* GraphQL */ `
  subscription OnCreateTrainingCycle(
    $filter: ModelSubscriptionTrainingCycleFilterInput
    $owner: String
  ) {
    onCreateTrainingCycle(filter: $filter, owner: $owner) {
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
export const onUpdateTrainingCycle = /* GraphQL */ `
  subscription OnUpdateTrainingCycle(
    $filter: ModelSubscriptionTrainingCycleFilterInput
    $owner: String
  ) {
    onUpdateTrainingCycle(filter: $filter, owner: $owner) {
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
export const onDeleteTrainingCycle = /* GraphQL */ `
  subscription OnDeleteTrainingCycle(
    $filter: ModelSubscriptionTrainingCycleFilterInput
    $owner: String
  ) {
    onDeleteTrainingCycle(filter: $filter, owner: $owner) {
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
export const onCreateEvent = /* GraphQL */ `
  subscription OnCreateEvent(
    $filter: ModelSubscriptionEventFilterInput
    $owner: String
  ) {
    onCreateEvent(filter: $filter, owner: $owner) {
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
export const onUpdateEvent = /* GraphQL */ `
  subscription OnUpdateEvent(
    $filter: ModelSubscriptionEventFilterInput
    $owner: String
  ) {
    onUpdateEvent(filter: $filter, owner: $owner) {
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
export const onDeleteEvent = /* GraphQL */ `
  subscription OnDeleteEvent(
    $filter: ModelSubscriptionEventFilterInput
    $owner: String
  ) {
    onDeleteEvent(filter: $filter, owner: $owner) {
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
export const onCreateGame = /* GraphQL */ `
  subscription OnCreateGame(
    $filter: ModelSubscriptionGameFilterInput
    $owner: String
  ) {
    onCreateGame(filter: $filter, owner: $owner) {
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
export const onUpdateGame = /* GraphQL */ `
  subscription OnUpdateGame(
    $filter: ModelSubscriptionGameFilterInput
    $owner: String
  ) {
    onUpdateGame(filter: $filter, owner: $owner) {
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
export const onDeleteGame = /* GraphQL */ `
  subscription OnDeleteGame(
    $filter: ModelSubscriptionGameFilterInput
    $owner: String
  ) {
    onDeleteGame(filter: $filter, owner: $owner) {
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
export const onCreateAnalysis = /* GraphQL */ `
  subscription OnCreateAnalysis(
    $filter: ModelSubscriptionAnalysisFilterInput
    $owner: String
  ) {
    onCreateAnalysis(filter: $filter, owner: $owner) {
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
export const onUpdateAnalysis = /* GraphQL */ `
  subscription OnUpdateAnalysis(
    $filter: ModelSubscriptionAnalysisFilterInput
    $owner: String
  ) {
    onUpdateAnalysis(filter: $filter, owner: $owner) {
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
export const onDeleteAnalysis = /* GraphQL */ `
  subscription OnDeleteAnalysis(
    $filter: ModelSubscriptionAnalysisFilterInput
    $owner: String
  ) {
    onDeleteAnalysis(filter: $filter, owner: $owner) {
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
export const onCreateSampleGame = /* GraphQL */ `
  subscription OnCreateSampleGame(
    $filter: ModelSubscriptionSampleGameFilterInput
    $owner: String
  ) {
    onCreateSampleGame(filter: $filter, owner: $owner) {
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
export const onUpdateSampleGame = /* GraphQL */ `
  subscription OnUpdateSampleGame(
    $filter: ModelSubscriptionSampleGameFilterInput
    $owner: String
  ) {
    onUpdateSampleGame(filter: $filter, owner: $owner) {
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
export const onDeleteSampleGame = /* GraphQL */ `
  subscription OnDeleteSampleGame(
    $filter: ModelSubscriptionSampleGameFilterInput
    $owner: String
  ) {
    onDeleteSampleGame(filter: $filter, owner: $owner) {
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
export const onCreateAchievement = /* GraphQL */ `
  subscription OnCreateAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $owner: String
  ) {
    onCreateAchievement(filter: $filter, owner: $owner) {
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
export const onUpdateAchievement = /* GraphQL */ `
  subscription OnUpdateAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $owner: String
  ) {
    onUpdateAchievement(filter: $filter, owner: $owner) {
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
export const onDeleteAchievement = /* GraphQL */ `
  subscription OnDeleteAchievement(
    $filter: ModelSubscriptionAchievementFilterInput
    $owner: String
  ) {
    onDeleteAchievement(filter: $filter, owner: $owner) {
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
export const onCreateQuiz = /* GraphQL */ `
  subscription OnCreateQuiz(
    $filter: ModelSubscriptionQuizFilterInput
    $owner: String
  ) {
    onCreateQuiz(filter: $filter, owner: $owner) {
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
export const onUpdateQuiz = /* GraphQL */ `
  subscription OnUpdateQuiz(
    $filter: ModelSubscriptionQuizFilterInput
    $owner: String
  ) {
    onUpdateQuiz(filter: $filter, owner: $owner) {
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
export const onDeleteQuiz = /* GraphQL */ `
  subscription OnDeleteQuiz(
    $filter: ModelSubscriptionQuizFilterInput
    $owner: String
  ) {
    onDeleteQuiz(filter: $filter, owner: $owner) {
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
