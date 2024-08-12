/* eslint-disable react/no-unescaped-entities */
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import Icon from '@mdi/react';
import { mdiCheckDecagram, mdiClockTimeThree, mdiLightbulb} from '@mdi/js';

interface Props {
	userName: string
	numberOfInterviews: number
	averageScore: number
	timeSpent: number
	className?: string
}

function WelcomeCard(props: Props) {
  const {
    userName,
    numberOfInterviews,
    averageScore,
    timeSpent,
    className,
  } = props
	
  const metrics = [
    {
      name: 'Interview Minutes',
      value: timeSpent,
      icon: <Icon path={mdiClockTimeThree} className="h-10 w-10 text-[hsl(var(--chart-2))]" />,
      color: 'bg-[hsl(var(--chart-2))]/20',
    },
    {
      name: 'Average Score',
      value: averageScore.toFixed(0),
      icon: <Icon path={mdiLightbulb} className="h-10 w-10 text-[hsl(var(--chart-3))]" />,
      color: 'bg-[hsl(var(--chart-3))]/20',
    },
    {
      name: 'Interviews',
      value: numberOfInterviews,
      icon: <Icon path={mdiCheckDecagram} className="h-10 w-10 text-[hsl(var(--chart-1))]" />,
      color: 'bg-[hsl(var(--chart-1))]/20',
    },
  ]

	return (
    <div className={`${className} w-full`}>
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Welcome {userName}!</CardTitle>
          <CardDescription>Your progress is awesome so far! Let's keep it up and get improve your interview skills!</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-row w-full justify-between">
          {
            metrics.map((metric, index) => {
              return (
                <div className="flex flex-row gap-4" key={index}>
                  <div className={`p-2 rounded-lg bg-muted border shadow-sm ${metric.color}`}>{metric.icon}</div>
                  <div>
                    <p className='text-sm text-muted-foreground'>{metric.name.toString()}</p>
                    <h3 className="text-2xl font-semibold leading-none tracking-tight">{metric.value.toString()}</h3>
                  </div>
                </div> 
              )
            })
          }
        </CardContent>
      </Card>
    </div>
	);
}

export default WelcomeCard;