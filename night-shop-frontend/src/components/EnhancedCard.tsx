import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  useTheme,
} from '@mui/material';

interface EnhancedCardProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  sx?: any;
}

const EnhancedCard: React.FC<EnhancedCardProps> = ({
  title,
  children,
  icon,
  action,
  sx,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        background: isDark
          ? theme.palette.background.paper
          : 'linear-gradient(135deg, rgba(0, 0, 0, 0.02) 0%, rgba(0, 0, 0, 0.01) 100%)',
        backdropFilter: isDark ? 'none' : 'blur(10px)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          boxShadow: isDark
            ? '0 12px 32px rgba(0, 0, 0, 0.3)'
            : '0 12px 32px rgba(0, 0, 0, 0.1)',
          transform: 'translateY(-2px)',
        },
        ...sx,
      }}
    >
      <CardHeader
        title={title}
        action={action}
        sx={{
          pb: 1,
          '& .MuiCardHeader-title': {
            fontSize: '1.1rem',
            fontWeight: 700,
          },
        }}
      />
      <Divider sx={{ opacity: 0.5 }} />
      <CardContent sx={{ flex: 1, pt: 2 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default EnhancedCard;
