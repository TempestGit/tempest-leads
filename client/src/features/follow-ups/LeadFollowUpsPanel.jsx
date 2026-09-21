import FollowUpsPage from './FollowUpsPage';

export default function LeadFollowUpsPanel({ lead }) {
  return (
    <section
      aria-label="Lead follow-ups"
      className="rounded-xl border border-line bg-surface p-5 sm:p-6"
    >
      <FollowUpsPage leadId={lead.id} />
    </section>
  );
}