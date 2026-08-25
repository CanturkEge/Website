using TaskPanel.Api.Middleware;
using TaskPanel.Api.Services;

var builder=WebApplication.CreateBuilder(args);
var port=Environment.GetEnvironmentVariable("PORT");
if(!string.IsNullOrWhiteSpace(port))builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
builder.Services.AddControllers();builder.Services.AddEndpointsApiExplorer();builder.Services.AddSwaggerGen();builder.Services.AddHttpClient();
builder.Services.AddScoped<SupabaseAuthService>();builder.Services.AddScoped<SupabaseRestClient>();builder.Services.AddScoped<TaskService>();builder.Services.AddScoped<UserService>();
builder.Services.AddCors(options=>options.AddDefaultPolicy(policy=>policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
var app=builder.Build();
if(app.Environment.IsDevelopment()){app.UseSwagger();app.UseSwaggerUI();}
app.UseCors();app.UseMiddleware<SupabaseAuthMiddleware>();app.MapControllers();
app.MapGet("/",()=>Results.Ok(new{service="EK Hotel API",status="running"}));
app.Run();
