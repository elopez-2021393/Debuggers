using System;
using Microsoft.EntityFrameworkCore;
using ReportService.Api.Models;

namespace ReportService.Api.Data;

public class ReportsDbContext : DbContext
{
    public ReportsDbContext(DbContextOptions<ReportsDbContext> options) : base(options) { }

    public DbSet<ReporteCache> ReportesCache { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ReporteCache>()
            .HasIndex(r => new { r.RestauranteId, r.FechaCalculo });
    }
}
