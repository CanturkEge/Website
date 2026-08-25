namespace TaskPanel.Api.Models;
public record CurrentUser(Guid Id,string Email,string FullName,string Role,string AccessToken);
public record LoginRequest(string Email,string Password);
public record CreateUserRequest(string FullName,string Email,string Password,string Role="reception");
public record UpdateRoleRequest(string Role);
public record CreateTaskRequest(string Title,string Description,Guid? AssigneeId=null,string Priority="normal",DateOnly? DueDate=null);
public record UpdateTaskStatusRequest(string Status);
