import { Container, Typography } from '@mui/material';

export default function App() {
  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" component="h1">
        Upcoming events
      </Typography>
      {/* Build the events page here */}
    </Container>
  );
}
