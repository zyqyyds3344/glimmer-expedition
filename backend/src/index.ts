import express from 'express';
import cors from 'cors';
import { db } from './db';
import { seed } from './seed';
import authRouter from './routes/auth';
import userRouter from './routes/user';
import sportsRouter from './routes/sports';
import achRouter from './routes/achievements';
import teamsRouter from './routes/teams';
import contractsRouter from './routes/contracts';
import tasksRouter from './routes/tasks';
import onboardingRouter from './routes/onboarding';
import lumiRouter from './routes/lumi';

seed();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/sports', sportsRouter);
app.use('/api/achievements', achRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/contracts', contractsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/lumi', lumiRouter);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`[glimmer] backend listening on http://localhost:${PORT}`);
});
