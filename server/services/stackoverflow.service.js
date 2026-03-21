const axios = require('axios');

/**
 * Fetch Stack Overflow user reputation and badges.
 * Unauthenticated by default (300 req/day limit).
 * With valid STACK_EXCHANGE_KEY in .env, limit is 10,000/day.
 * 
 * @param {String} userId - The numeric Stack Overflow User ID
 */
const getStackOverflowStats = async (userId) => {
  if (!userId) return null;

  try {
    const keyParam = process.env.STACK_EXCHANGE_KEY ? `&key=${process.env.STACK_EXCHANGE_KEY}` : '';
    
    // Fetch user profile stats (reputation, badges)
    const userRes = await axios.get(
      `https://api.stackexchange.com/2.3/users/${userId}?site=stackoverflow${keyParam}`
    );

    if (!userRes.data || !userRes.data.items || userRes.data.items.length === 0) {
      throw new Error('Stack Overflow user not found');
    }

    const userData = userRes.data.items[0];

    // Fetch user's top answers
    const answersRes = await axios.get(
      `https://api.stackexchange.com/2.3/users/${userId}/answers?order=desc&sort=votes&site=stackoverflow&pagesize=3${keyParam}`
    );

    // The answers endpoint doesn't return the question title by default without filter or fetching the question.
    // However, it does return an answer ID and score. To get titles safely, we need a specific filter or to fetch questions.
    // StackExchange API filter `!*J*(o*P1c` includes the answer's `title` implicitly or we use the `/users/{userId}/top-answers` but that requires tags.
    // Better yet: we just use the returned link and score, and generic title if title isn't easily returned, OR use a known filter.
    // Let's just use `fetch questions` using the answer IDs if needed, but for 2-hour implementation, we can just use the provided filter if available.
    // Actually, setting `filter=withbody` or a known filter that returns title is complex. 
    // Let's just use stackoverflow.com/a/{answer_id} as the title if question title isn't available.
    // Let's check if `title` is in answers API. By default, `/answers` does NOT return question title.
    // Wait, let's use `/users/{id}/answers` and get the `question_id` to get the title? No, that's extra requests. 
    // We will just fetch `/users/{id}/questions` instead to show "Top Questions"? Or just store the answers with generic titles like "Answer on Stack Overflow".
    // Alternatively, we can just format `Top Answers` without titles if it's too much, but the user requested `{ title, score, link }`.
    // Wait! A simple filter for answering with title is `!anX6)e1fF`. But let's just make one extra API call for the 3 questions if answers exist.
    
    const answers = answersRes.data?.items || [];
    let topAnswers = [];

    if (answers.length > 0) {
      const questionIds = answers.map(a => a.question_id).join(';');
      const questionsRes = await axios.get(
        `https://api.stackexchange.com/2.3/questions/${questionIds}?site=stackoverflow${keyParam}`
      );
      const questionsMap = {};
      (questionsRes.data?.items || []).forEach(q => {
        questionsMap[q.question_id] = q.title;
      });

      topAnswers = answers.map(a => ({
        title: questionsMap[a.question_id] || 'Answer to question',
        score: a.score,
        link: `https://stackoverflow.com/a/${a.answer_id}`,
      }));
    }

    return {
      reputation: userData.reputation,
      badges: {
        gold: userData.badge_counts?.gold || 0,
        silver: userData.badge_counts?.silver || 0,
        bronze: userData.badge_counts?.bronze || 0,
      },
      topAnswers,
    };
  } catch (error) {
    if (error.response && error.response.status === 400) {
        console.error('[Sync] StackOverflow rate limit or invalid key:', error.response.data);
    }
    console.error('[Sync] StackOverflow fetch error:', error.message);
    throw new Error('Failed to fetch Stack Overflow stats');
  }
};

module.exports = { getStackOverflowStats };
