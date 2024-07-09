import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "./button"
import Icon from "@mdi/react"
import { mdiArrowLeft, mdiArrowRight, mdiCheck } from "@mdi/js"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  handlePreviousPage: () => void,
  handleNextPage: () => void,
  handleFinish: () => void,
  currentPage: number
}

const CardFooter = React.forwardRef<
  HTMLDivElement,
  CardFooterProps
>(({ className, handlePreviousPage, handleNextPage, handleFinish, currentPage, ...props }, ref) => (
  <div ref={ref} className="flex w-full justify-between items-center p-6 pt-0" {...props}>
    <Button
      disabled={currentPage < 1}
      variant="secondary"
      onClick={handlePreviousPage}
    >
      <Icon className="h4 w-4 mr-2" path={mdiArrowLeft} />
      Previous
    </Button>

    {currentPage < 2 && (
      <Button
        className="ml-auto"
        variant="default"
        onClick={handleNextPage}
      >
        Next
        <Icon className="h4 w-4 ml-2" path={mdiArrowRight} />
      </Button>
    )}

    {currentPage === 2 && (
      <Button
        className="ml-auto"
        variant="default"
        onClick={handleFinish}
      >
        Start
        <Icon className="h4 w-4 ml-2" path={mdiCheck} />
      </Button>
    )}
  </div>
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
