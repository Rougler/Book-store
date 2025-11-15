"""Scheduled tasks for weekly commission processing."""

import logging
from contextlib import asynccontextmanager
from datetime import datetime, time

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from .weekly_commissions import process_weekly_team_commissions

logger = logging.getLogger(__name__)

# Global scheduler instance
scheduler: AsyncIOScheduler | None = None


def start_scheduler() -> AsyncIOScheduler:
    """Start the scheduler for weekly commission processing.
    
    Schedules commission processing every Monday between 4-7 PM.
    """
    global scheduler
    
    if scheduler is not None:
        return scheduler
    
    scheduler = AsyncIOScheduler()
    
    # Schedule weekly commission processing
    # Every Monday at 4:00 PM (16:00)
    scheduler.add_job(
        process_weekly_commissions_job,
        trigger=CronTrigger(day_of_week='mon', hour=16, minute=0),
        id='weekly_team_commissions',
        name='Process Weekly Team Commissions',
        replace_existing=True,
    )
    
    scheduler.start()
    logger.info("Scheduler started - Weekly commissions scheduled for Mondays at 4:00 PM")
    
    return scheduler


def stop_scheduler() -> None:
    """Stop the scheduler."""
    global scheduler
    if scheduler is not None:
        scheduler.shutdown()
        scheduler = None
        logger.info("Scheduler stopped")


def process_weekly_commissions_job() -> None:
    """Job function to process weekly team commissions."""
    try:
        logger.info("Starting weekly team commission processing...")
        stats = process_weekly_team_commissions()
        logger.info(
            f"Weekly commission processing completed: "
            f"{stats['users_processed']} users, "
            f"₹{stats['total_commissions']:,.2f} total, "
            f"{stats['transactions_created']} transactions"
        )
    except Exception as e:
        logger.error(f"Error processing weekly commissions: {e}", exc_info=True)


@asynccontextmanager
async def lifespan(app):
    """Lifespan context manager for FastAPI app.
    
    Starts scheduler on startup and stops on shutdown.
    """
    # Startup
    start_scheduler()
    yield
    # Shutdown
    stop_scheduler()

