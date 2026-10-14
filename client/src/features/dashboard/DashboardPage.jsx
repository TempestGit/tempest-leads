import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, CircleAlert, IndianRupee, Layers3, RefreshCw, TrendingUp, Users } from "lucide-react";
import { useDashboardQuery } from "./dashboard.queries.js";

const money = (v) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(v || 0));
const date = (v) => v ? new Date(v).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const nice = (v) => String(v || "—").replaceAll("_", " ");
const Card = ({ title, value, icon: Icon, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-slate-500">{title}</p><Icon className="h-5 w-5 text-indigo-600" /></div>
    <p className="mt-3 break-words text-2xl font-bold text-slate-900">{value}</p>
    {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
  </div>
);
const Section = ({ title, to, children }) => (
  <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-5 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">{title}</h2>{to && <Link to={to} className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline">View all <ArrowRight className="h-4 w-4" /></Link>}</div>
    {children}
  </section>
);
export default function DashboardPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useDashboardQuery();
  if (isPending) return <div className="p-6 text-slate-500" role="status">Loading dashboard…</div>;
  if (isError) return <div className="space-y-3 p-6"><p role="alert" className="text-red-600">Could not load dashboard: {error?.response?.data?.message || error.message}</p><button onClick={() => refetch()} className="rounded-lg bg-indigo-600 px-4 py-2 text-white">Retry</button></div>;
  const { summary: s, stages, followups, meetings, recentLeads, nextFollowups, monthly } = data;
  const maxStage = Math.max(1, ...stages.map(x => Number(x.count)));
  const maxMonth = Math.max(1, ...monthly.map(x => Number(x.count)));
  const conversion = Number(s.totalLeads) ? (100 * Number(s.wonLeads) / Number(s.totalLeads)).toFixed(1) : "0.0";
  return <div className="space-y-6 p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Dashboard</h1><p className="mt-1 text-sm text-slate-500">Your pipeline and priority actions at a glance</p></div><button onClick={() => refetch()} disabled={isFetching} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:opacity-50"><RefreshCw className="h-4 w-4" /> Refresh</button></header>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card title="Total leads" value={Number(s.totalLeads).toLocaleString("en-IN")} icon={Users} hint={`${s.newThisMonth} added this month`} />
      <Card title="Open leads" value={s.activeLeads} icon={Layers3} hint="Current open opportunities" />
      <Card title="Open pipeline value" value={money(s.pipelineValue)} icon={IndianRupee} hint="Estimated value of open leads" />
      <Card title="Win rate" value={`${conversion}%`} icon={TrendingUp} hint={`${s.wonLeads} won · ${s.lostLeads} lost`} />
      <Card title="Overdue follow-ups" value={followups.overdue} icon={CircleAlert} hint="Pending and past due" />
      <Card title="Follow-ups next 7 days" value={followups.upcoming} icon={CalendarDays} />
      <Card title="Meetings next 7 days" value={meetings.upcoming} icon={CalendarDays} />
      <Card title="Won leads" value={s.wonLeads} icon={TrendingUp} />
    </div>
    <div className="grid gap-5 xl:grid-cols-2">
      <Section title="Pipeline by stage" to="/leads"><div className="space-y-4">{stages.length ? stages.map(x => <div key={x.stage}><div className="mb-1 flex justify-between gap-2 text-sm"><span className="font-medium text-slate-700">{nice(x.stage)}</span><span className="text-slate-500">{x.count} · {money(x.value)}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${Number(x.count) / maxStage * 100}%` }} /></div></div>) : <p className="text-sm text-slate-500">No leads yet.</p>}</div></Section>
      <Section title="New leads by month" to="/leads"><div className="flex h-64 items-end gap-3 border-b border-slate-200 pb-2">{monthly.length ? monthly.map(x => <div key={x.month} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-xs font-medium text-slate-500">{x.count}</span><div className="w-full max-w-14 rounded-t-lg bg-indigo-500" style={{ height: `${Math.max(3, Number(x.count) / maxMonth * 85)}%` }} /><span className="text-center text-xs text-slate-500">{x.month.slice(5)}</span></div>) : <p className="self-center text-sm text-slate-500">No leads in the last six months.</p>}</div><p className="mt-2 text-xs text-slate-400">Month labels (01–12), chronological order</p></Section>
      <Section title="Priority follow-ups" to="/followups"><div className="divide-y divide-slate-100">{nextFollowups.length ? nextFollowups.map(x => <Link key={x.id} to={`/leads/${x.leadId}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{x.companyName}</p><p className="truncate text-xs text-slate-500">{x.action}</p></div><span className="shrink-0 text-xs text-slate-500">{date(x.dueAt)}</span></Link>) : <p className="py-4 text-sm text-slate-500">No pending follow-ups.</p>}</div></Section>
      <Section title="Recently created leads" to="/leads"><div className="divide-y divide-slate-100">{recentLeads.length ? recentLeads.map(x => <Link key={x.id} to={`/leads/${x.id}`} className="flex items-center justify-between gap-3 py-3 hover:bg-slate-50"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{x.companyName}</p><p className="text-xs text-slate-500">{x.leadCode} · {nice(x.stage)}</p></div><span className="shrink-0 text-sm font-medium text-slate-700">{money(x.value)}</span></Link>) : <p className="py-4 text-sm text-slate-500">No leads yet.</p>}</div></Section>
    </div>
  </div>;
}
