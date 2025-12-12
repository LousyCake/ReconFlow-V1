import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Activity, Server, Globe, Lock } from "lucide-react";

interface Subdomain {
  _id: string;
  subdomain: string;
  ip?: string;
  ports: number[];
  services: string[];
  risk: "High" | "Medium" | "Low";
  exposures: any[];
}

interface ScanStats {
  subdomainCount: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export function RiskDistributionChart({ stats }: { stats: ScanStats }) {
  const data = [
    { name: "High", value: stats.highRiskCount, color: "#ef4444" }, // Red-500
    { name: "Medium", value: stats.mediumRiskCount, color: "#eab308" }, // Yellow-500
    { name: "Low", value: stats.lowRiskCount, color: "#22c55e" }, // Green-500
  ].filter((d) => d.value > 0);

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
          <Activity className="h-4 w-4 text-purple-400" />
          Risk Distribution
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1635', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-4 mt-4">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2 text-xs text-white/70">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
              <span>{d.name} ({d.value})</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function PortsChart({ subdomains }: { subdomains: Subdomain[] }) {
  // Aggregate ports
  const portCounts: Record<string, number> = {};
  subdomains.forEach((sub) => {
    sub.ports.forEach((port) => {
      portCounts[port] = (portCounts[port] || 0) + 1;
    });
  });

  const data = Object.entries(portCounts)
    .map(([port, count]) => ({ port: `Port ${port}`, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-white/5 pb-4">
        <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
          <Server className="h-4 w-4 text-blue-400" />
          Top Open Ports
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
              <XAxis 
                dataKey="port" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <YAxis 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tick={{ fill: 'rgba(255,255,255,0.5)' }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ backgroundColor: '#1a1635', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatCard({ title, value, icon: Icon, color, bg }: any) {
  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden hover:bg-white/10 transition-colors">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-white/50 uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold mt-1 text-white">{value}</h3>
        </div>
        <div className={`h-12 w-12 rounded-xl ${bg || 'bg-white/10'} flex items-center justify-center ${color || 'text-white'}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export function FindingsTable({ subdomains }: { subdomains: Subdomain[] }) {
  const riskySubdomains = subdomains.filter(s => s.risk !== "Low" || s.exposures.length > 0);

  return (
    <Card className="border border-white/10 bg-white/5 backdrop-blur-md shadow-xl rounded-2xl overflow-hidden col-span-full">
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="divide-y divide-white/5">
            {riskySubdomains.length === 0 ? (
              <div className="text-center py-12 text-white/40">
                No critical findings detected.
              </div>
            ) : (
              riskySubdomains.map((sub) => (
                <div key={sub._id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-white text-lg">{sub.subdomain}</h4>
                        <Badge variant="outline" className={`
                          border-0 px-2 py-0.5 text-xs
                          ${sub.risk === "High" ? "bg-red-500/20 text-red-300" : "bg-yellow-500/20 text-yellow-300"}
                        `}>
                          {sub.risk} Risk
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-white/50">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {sub.ip || "No IP"}
                        </div>
                        {sub.ports.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Server className="h-3 w-3" />
                            {sub.ports.length} Ports Open
                          </div>
                        )}
                      </div>

                      {sub.exposures.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-xs font-medium text-red-300 uppercase tracking-wider flex items-center gap-2">
                            <Lock className="h-3 w-3" /> Exposed Endpoints
                          </p>
                          <div className="grid gap-2">
                            {sub.exposures.map((exp, i) => (
                              <div key={i} className="flex items-center gap-3 text-sm text-red-200/80 bg-red-500/5 p-2 rounded-lg border border-red-500/10 w-fit">
                                <AlertTriangle className="h-3 w-3 text-red-400" />
                                <span className="font-mono text-xs">{exp.path}</span>
                                <span className="text-xs opacity-50">(HTTP {exp.status})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1 max-w-[200px] justify-end content-start">
                      {sub.ports.map(p => (
                        <Badge key={p} variant="outline" className="bg-white/5 border-white/10 text-white/60 text-[10px] px-1.5 py-0.5 h-5">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}