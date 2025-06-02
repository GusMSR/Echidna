/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
export const createTrainingCycle = /* GraphQL */ `
  mutation CreateTrainingCycle(
    $input: CreateTrainingCycleInput!
    $condition: ModelTrainingCycleConditionInput
  ) {
    createTrainingCycle(input: $input, condition: $condition) {
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
export const updateTrainingCycle = /* GraphQL */ `
  mutation UpdateTrainingCycle(
    $input: UpdateTrainingCycleInput!
    $condition: ModelTrainingCycleConditionInput
  ) {
    updateTrainingCycle(input: $input, condition: $condition) {
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
export const deleteTrainingCycle = /* GraphQL */ `
  mutation DeleteTrainingCycle(
    $input: DeleteTrainingCycleInput!
    $condition: ModelTrainingCycleConditionInput
  ) {
    deleteTrainingCycle(input: $input, condition: $condition) {
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
export const createEvent = /* GraphQL */ `
  mutation CreateEvent(
    $input: CreateEventInput!
    $condition: ModelEventConditionInput
  ) {
    createEvent(input: $input, condition: $condition) {
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
export const updateEvent = /* GraphQL */ `
  mutation UpdateEvent(
    $input: UpdateEventInput!
    $condition: ModelEventConditionInput
  ) {
    updateEvent(input: $input, condition: $condition) {
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
export const deleteEvent = /* GraphQL */ `
  mutation DeleteEvent(
    $input: DeleteEventInput!
    $condition: ModelEventConditionInput
  ) {
    deleteEvent(input: $input, condition: $condition) {
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
export const createGame = /* GraphQL */ `
  mutation CreateGame(
    $input: CreateGameInput!
    $condition: ModelGameConditionInput
  ) {
    createGame(input: $input, condition: $condition) {
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
export const updateGame = /* GraphQL */ `
  mutation UpdateGame(
    $input: UpdateGameInput!
    $condition: ModelGameConditionInput
  ) {
    updateGame(input: $input, condition: $condition) {
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
export const deleteGame = /* GraphQL */ `
  mutation DeleteGame(
    $input: DeleteGameInput!
    $condition: ModelGameConditionInput
  ) {
    deleteGame(input: $input, condition: $condition) {
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
export const createAnalysis = /* GraphQL */ `
  mutation CreateAnalysis(
    $input: CreateAnalysisInput!
    $condition: ModelAnalysisConditionInput
  ) {
    createAnalysis(input: $input, condition: $condition) {
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
export const updateAnalysis = /* GraphQL */ `
  mutation UpdateAnalysis(
    $input: UpdateAnalysisInput!
    $condition: ModelAnalysisConditionInput
  ) {
    updateAnalysis(input: $input, condition: $condition) {
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
export const deleteAnalysis = /* GraphQL */ `
  mutation DeleteAnalysis(
    $input: DeleteAnalysisInput!
    $condition: ModelAnalysisConditionInput
  ) {
    deleteAnalysis(input: $input, condition: $condition) {
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
export const createSampleGame = /* GraphQL */ `
  mutation CreateSampleGame(
    $input: CreateSampleGameInput!
    $condition: ModelSampleGameConditionInput
  ) {
    createSampleGame(input: $input, condition: $condition) {
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
export const updateSampleGame = /* GraphQL */ `
  mutation UpdateSampleGame(
    $input: UpdateSampleGameInput!
    $condition: ModelSampleGameConditionInput
  ) {
    updateSampleGame(input: $input, condition: $condition) {
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
export const deleteSampleGame = /* GraphQL */ `
  mutation DeleteSampleGame(
    $input: DeleteSampleGameInput!
    $condition: ModelSampleGameConditionInput
  ) {
    deleteSampleGame(input: $input, condition: $condition) {
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
export const createAchievement = /* GraphQL */ `
  mutation CreateAchievement(
    $input: CreateAchievementInput!
    $condition: ModelAchievementConditionInput
  ) {
    createAchievement(input: $input, condition: $condition) {
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
export const updateAchievement = /* GraphQL */ `
  mutation UpdateAchievement(
    $input: UpdateAchievementInput!
    $condition: ModelAchievementConditionInput
  ) {
    updateAchievement(input: $input, condition: $condition) {
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
export const deleteAchievement = /* GraphQL */ `
  mutation DeleteAchievement(
    $input: DeleteAchievementInput!
    $condition: ModelAchievementConditionInput
  ) {
    deleteAchievement(input: $input, condition: $condition) {
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
export const createQuiz = /* GraphQL */ `
  mutation CreateQuiz(
    $input: CreateQuizInput!
    $condition: ModelQuizConditionInput
  ) {
    createQuiz(input: $input, condition: $condition) {
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
export const updateQuiz = /* GraphQL */ `
  mutation UpdateQuiz(
    $input: UpdateQuizInput!
    $condition: ModelQuizConditionInput
  ) {
    updateQuiz(input: $input, condition: $condition) {
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
export const deleteQuiz = /* GraphQL */ `
  mutation DeleteQuiz(
    $input: DeleteQuizInput!
    $condition: ModelQuizConditionInput
  ) {
    deleteQuiz(input: $input, condition: $condition) {
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
