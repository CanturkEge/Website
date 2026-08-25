using Microsoft.AspNetCore.Mvc;using TaskPanel.Api.Models;using TaskPanel.Api.Services;
namespace TaskPanel.Api.Controllers;
[ApiController,Route("api/users")]public class UsersController(UserService service):ControllerBase{
  CurrentUser Me=>(CurrentUser)HttpContext.Items["User"]!;
  [HttpGet("me")]public IActionResult Current()=>Ok(Me);
  [HttpGet]public async Task<IActionResult> Get(){try{return Ok(await service.GetAllAsync(Me));}catch(UnauthorizedAccessException){return Forbid();}catch(HttpRequestException e){return BadRequest(new{message=e.Message});}}
  [HttpPost]public async Task<IActionResult> Create(CreateUserRequest request){try{await service.CreateAsync(request,Me);return StatusCode(201);}catch(UnauthorizedAccessException){return Forbid();}catch(Exception e)when(e is HttpRequestException or InvalidOperationException or ArgumentException){return BadRequest(new{message=e.Message});}}
  [HttpPatch("{id:guid}/role")]public async Task<IActionResult> UpdateRole(Guid id,UpdateRoleRequest request){try{await service.UpdateRoleAsync(id,request.Role,Me);return NoContent();}catch(UnauthorizedAccessException){return Forbid();}catch(Exception e)when(e is HttpRequestException or InvalidOperationException or ArgumentException){return BadRequest(new{message=e.Message});}}
}
