"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Battery, ArrowRight, ArrowLeft, CheckCircle, RotateCcw } from "lucide-react";

const quizQuestions = [
  {
    id: 1,
    question: "How would you rate your current lead generation process?",
    options: [
      { value: "1", label: "We don't have a formal process" },
      { value: "2", label: "Basic - mostly referrals and word of mouth" },
      { value: "3", label: "Developing - some outreach and marketing" },
      { value: "4", label: "Strong - consistent pipeline with multiple channels" },
      { value: "5", label: "Excellent - predictable, scalable lead flow" },
    ],
  },
  {
    id: 2,
    question: "How well do you understand your ideal customer profile?",
    options: [
      { value: "1", label: "Not defined" },
      { value: "2", label: "General idea but not documented" },
      { value: "3", label: "Documented but not consistently used" },
      { value: "4", label: "Well-defined and guides our targeting" },
      { value: "5", label: "Data-driven and continuously refined" },
    ],
  },
  {
    id: 3,
    question: "How effective is your sales follow-up process?",
    options: [
      { value: "1", label: "No formal follow-up process" },
      { value: "2", label: "Inconsistent - depends on the salesperson" },
      { value: "3", label: "Basic CRM tracking with some automation" },
      { value: "4", label: "Structured process with regular touchpoints" },
      { value: "5", label: "Optimized with analytics and A/B testing" },
    ],
  },
  {
    id: 4,
    question: "How do you measure marketing ROI?",
    options: [
      { value: "1", label: "We don't track marketing ROI" },
      { value: "2", label: "Basic tracking of leads from campaigns" },
      { value: "3", label: "Track leads and some conversion metrics" },
      { value: "4", label: "Full funnel tracking with attribution" },
      { value: "5", label: "Advanced analytics with predictive modeling" },
    ],
  },
  {
    id: 5,
    question: "How aligned are your sales and marketing teams?",
    options: [
      { value: "1", label: "Separate silos with little communication" },
      { value: "2", label: "Occasional meetings but no shared goals" },
      { value: "3", label: "Regular communication with some shared metrics" },
      { value: "4", label: "Strong alignment with shared KPIs" },
      { value: "5", label: "Fully integrated revenue team" },
    ],
  },
];

export default function GrowthIQQuizPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [quizQuestions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  const calculateScore = () => {
    const total = Object.values(answers).reduce((sum, val) => sum + parseInt(val), 0);
    const maxScore = quizQuestions.length * 5;
    return Math.round((total / maxScore) * 100);
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "Growth Leader", color: "bg-green-500", description: "Your growth engine is firing on all cylinders!" };
    if (score >= 60) return { level: "Growth Ready", color: "bg-blue-500", description: "Strong foundation with room for optimization." };
    if (score >= 40) return { level: "Growth Potential", color: "bg-yellow-500", description: "Key opportunities to accelerate your growth." };
    return { level: "Growth Starter", color: "bg-orange-500", description: "Let's build your growth foundation together." };
  };

  if (showResults) {
    const score = calculateScore();
    const { level, color, description } = getScoreLevel(score);

    return (
      <div className="container mx-auto py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Your Growth IQ Results</CardTitle>
            <CardDescription>Based on your responses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-bold text-primary mb-2">{score}%</div>
              <Badge className={`${color} text-white text-lg px-4 py-1`}>{level}</Badge>
              <p className="mt-4 text-muted-foreground">{description}</p>
            </div>

            <div className="space-y-4 pt-6 border-t">
              <h3 className="font-semibold">Recommended Next Steps:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Schedule a free consultation to discuss your results</li>
                <li>• Download our Growth Acceleration Guide</li>
                <li>• Explore our services tailored to your growth stage</li>
              </ul>
            </div>

            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={handleRestart} className="flex-1">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
              <Button className="flex-1">
                Get Your Action Plan
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQ = quizQuestions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Battery className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Growth IQ Quiz</CardTitle>
              <CardDescription>Assess your business growth readiness</CardDescription>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <h2 className="text-xl font-semibold">{currentQ.question}</h2>

          <RadioGroup value={currentAnswer} onValueChange={handleAnswer}>
            <div className="space-y-3">
              {currentQ.options.map((option) => (
                <div
                  key={option.value}
                  className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                    currentAnswer === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={`option-${option.value}`} />
                  <Label htmlFor={`option-${option.value}`} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button onClick={handleNext} disabled={!currentAnswer}>
              {currentQuestion === quizQuestions.length - 1 ? "See Results" : "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
