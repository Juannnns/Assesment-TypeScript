import cron from "node-cron";
import { Op } from "sequelize";
import { Ticket, Comment, User } from "../models";
import { sendReminderEmail } from "./emailService";

// Check for unanswered tickets every hour
export function startCronJobs() {
  // Run every hour at minute 0
  cron.schedule("0 * * * *", async () => {
    console.log("🔄 Running unanswered tickets check...");
    await checkUnansweredTickets();
  });

  console.log("⏰ Cron jobs initialized");
}

async function checkUnansweredTickets() {
  try {
    // Find tickets that are open or in_progress and have no comments from agents
    // or haven't been updated in more than 24 hours
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const unansweredTickets = await Ticket.findAll({
      where: {
        status: {
          [Op.in]: ["open", "in_progress"],
        },
        createdAt: {
          [Op.lt]: twentyFourHoursAgo,
        },
      },
      include: [
        {
          model: User,
          as: "createdBy",
          attributes: ["id", "name", "email"],
        },
        {
          model: Comment,
          as: "comments",
          include: [
            {
              model: User,
              as: "author",
              attributes: ["id", "role"],
            },
          ],
        },
      ],
    });

    // Filter to tickets that haven't received an agent response
    const ticketsNeedingAttention = unansweredTickets.filter((ticket: any) => {
      const hasAgentResponse = ticket.comments?.some(
        (comment: any) => comment.author?.role === "agent"
      );
      return !hasAgentResponse;
    });

    if (ticketsNeedingAttention.length === 0) {
      console.log("✅ No unanswered tickets found");
      return;
    }

    console.log(`⚠️ Found ${ticketsNeedingAttention.length} unanswered tickets`);

    // Get all agents to notify
    const agents = await User.findAll({
      where: { role: "agent" },
    });

    // Send reminder emails to agents
    for (const agent of agents) {
      const ticketInfo = ticketsNeedingAttention.map((ticket: any) => ({
        id: ticket.id,
        title: ticket.title,
        priority: ticket.priority,
        hoursOld: Math.round((Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60)),
      }));

      await sendReminderEmail(
        agent.email,
        agent.name,
        ticketInfo
      );
    }
  } catch (error) {
    console.error("❌ Error in unanswered tickets check:", error);
  }
}
