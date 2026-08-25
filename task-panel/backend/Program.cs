using TaskPanel.Api;
var builder=WebApplication.CreateBuilder(args);
builder.Services.AddControllers();builder.Services.AddSwaggerGen();builder.Services.AddHttpClient();builder.Services.AddScoped<Db>();builder.Services.AddScoped<AuthService>();builder.Services.AddScoped<TaskService>();builder.Services.AddScoped<UserService>();
builder.Services.AddCors(x=>x.AddDefaultPolicy(p=>p.WithOrigins(builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()??[]).AllowAnyHeader().AllowAnyMethod()));
var app=builder.Build();if(app.Environment.IsDevelopment()){app.UseSwagger();app.UseSwaggerUI();}app.UseHttpsRedirection();app.UseCors();app.UseMiddleware<AuthMiddleware>();app.MapControllers();app.Run();
