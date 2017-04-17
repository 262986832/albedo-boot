package com.albedo.java.modules.sys.web;

import com.albedo.java.common.security.SecurityUtil;
import com.albedo.java.modules.sys.domain.Role;
import com.albedo.java.modules.sys.repository.RoleRepository;
import com.albedo.java.modules.sys.service.RoleService;
import com.albedo.java.util.JsonUtil;
import com.albedo.java.util.PublicUtil;
import com.albedo.java.util.StringUtil;
import com.albedo.java.util.base.Reflections;
import com.albedo.java.util.domain.Globals;
import com.albedo.java.util.domain.PageModel;
import com.albedo.java.util.exception.RuntimeMsgException;
import com.albedo.java.web.rest.ResultBuilder;
import com.albedo.java.web.rest.base.DataResource;
import com.alibaba.fastjson.JSON;
import com.codahale.metrics.annotation.Timed;
import com.google.common.collect.Lists;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.net.URISyntaxException;

/**
 * REST controller for managing Station.
 */
@Controller
@RequestMapping("${albedo.adminPath}/sys/role")
public class RoleResource extends DataResource<RoleService, Role> {

	@Resource
	private RoleService roleService;

	@ModelAttribute
	public Role get(@RequestParam(required = false) String id) throws Exception {
		String path = request.getRequestURI();
		if (path != null && !path.contains("checkBy") && !path.contains("find") && PublicUtil.isNotEmpty(id)) {
			return roleService.findOne(id);
		} else {
			return new Role();
		}
	}

	@RequestMapping(value = "/", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	@Timed
	public String list() {
		return "modules/sys/roleList";
	}

	/**
	 *
	 * @param pm
	 * @return
	 */
	@RequestMapping(value = "/page", method = RequestMethod.GET)
	public ResponseEntity getPage(PageModel<Role> pm) {
		roleService.findPage(pm, SecurityUtil.dataScopeFilter());
		JSON rs = JsonUtil.getInstance().setRecurrenceStr("org_name").toJsonObject(pm);
		return ResultBuilder.buildObject(rs);
	}

	@RequestMapping(value = "/edit", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
	@Timed
	public String form(Role role, Model model) {
		return "modules/sys/roleForm";
	}

	/**
	 *
	 * @param role
	 * @return
	 * @throws URISyntaxException
	 */
	@RequestMapping(value = "/edit", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
	@Timed
	public ResponseEntity save(Role role){
		log.debug("REST request to save Role : {}", role);
		// Lowercase the role login before comparing with database
		if (!checkByProperty(Reflections.createObj(Role.class, Lists.newArrayList(Role.F_ID, Role.F_NAME),
				role.getId(),role.getName()))) {
			throw new RuntimeMsgException("名称已存在");
		}
		roleService.save(role);
		SecurityUtil.clearUserJedisCache();
		return ResultBuilder.buildOk("保存", role.getName(), "成功");
	}

	/**
	 *
	 * @param ids
	 * @return
	 */
	@RequestMapping(value = "/delete/{ids:" + Globals.LOGIN_REGEX
			+ "}", method = RequestMethod.DELETE, produces = MediaType.APPLICATION_JSON_VALUE)
	@Timed
	public ResponseEntity delete(@PathVariable String ids) {
		log.debug("REST request to delete Role: {}", ids);
		roleService.delete(Lists.newArrayList(ids.split(StringUtil.SPLIT_DEFAULT)), SecurityUtil.getCurrentAuditor());
		SecurityUtil.clearUserJedisCache();
		return ResultBuilder.buildOk("删除成功");
	}

	/**
	 *
	 * @param ids
	 * @return
	 */
	@RequestMapping(value = "/lock/{ids:" + Globals.LOGIN_REGEX
			+ "}", method = RequestMethod.POST, produces = MediaType.APPLICATION_JSON_VALUE)
	@Timed
	public ResponseEntity lockOrUnLock(@PathVariable String ids) {
		log.debug("REST request to lockOrUnLock User: {}", ids);
		roleService.lockOrUnLock(Lists.newArrayList(ids.split(StringUtil.SPLIT_DEFAULT)), SecurityUtil.getCurrentAuditor());
		SecurityUtil.clearUserJedisCache();
		return ResultBuilder.buildOk("操作成功");
	}

}
