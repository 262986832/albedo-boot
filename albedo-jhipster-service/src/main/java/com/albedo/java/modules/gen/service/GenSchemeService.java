package com.albedo.java.modules.gen.service;

import com.albedo.java.common.domain.base.BaseEntity;
import com.albedo.java.common.domain.data.DynamicSpecifications;
import com.albedo.java.common.domain.data.SpecificationDetail;
import com.albedo.java.common.repository.service.BaseService;
import com.albedo.java.common.security.SecurityUtil;
import com.albedo.java.modules.gen.domain.GenScheme;
import com.albedo.java.modules.gen.domain.GenTable;
import com.albedo.java.modules.gen.domain.GenTemplate;
import com.albedo.java.modules.gen.domain.xml.GenConfig;
import com.albedo.java.modules.gen.repository.GenSchemeRepository;
import com.albedo.java.modules.gen.repository.GenTableRepository;
import com.albedo.java.modules.gen.util.GenUtil;
import com.albedo.java.util.StringUtil;
import com.albedo.java.util.domain.PageModel;
import com.albedo.java.util.domain.QueryCondition;
import com.albedo.java.util.exception.RuntimeMsgException;
import com.google.common.collect.Lists;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.inject.Inject;
import java.util.List;
import java.util.Map;

/**
 * Service class for managing genSchemes.
 */
@Service
@Transactional
public class GenSchemeService extends BaseService<GenScheme> {

    @Inject
    private GenSchemeRepository genSchemeRepository;
    @Inject
    private GenTableRepository genTableRepository;

    public GenScheme save(GenScheme genScheme) {
        genScheme = genSchemeRepository.save(genScheme);
        log.debug("Save Information for GenScheme: {}", genScheme);
        SecurityUtil.clearUserJedisCache();
        return genScheme;
    }


    public void delete(String ids) {
    	Lists.newArrayList(ids.split(StringUtil.SPLIT_DEFAULT)).forEach(id ->{
    		genSchemeRepository.findOneById(id).map(u -> {
    			deleteById(id);
                log.debug("Deleted GenScheme: {}", u);
				return u;
			}).orElseThrow(() -> new RuntimeMsgException("用户 " + id + " 信息为空，删除失败"));
    	});
    	SecurityUtil.clearUserJedisCache();
    }


	public void lockOrUnLock(String ids) {
		Lists.newArrayList(ids.split(StringUtil.SPLIT_DEFAULT)).forEach(id ->{
			genSchemeRepository.findOneById(id).map(u -> {
    			operateStatusById(id, BaseEntity.FLAG_NORMAL.equals(u.getStatus()) ? BaseEntity.FLAG_UNABLE : BaseEntity.FLAG_NORMAL);
                log.debug("LockOrUnLock User: {}", u);
				return u;
			}).orElseThrow(() -> new RuntimeMsgException("用户 " + id + " 信息为空，操作失败"));
    	});
		SecurityUtil.clearUserJedisCache();
	}

	@Transactional(readOnly=true)
	public GenScheme findOne(String id) {
		return genSchemeRepository.findOne(id);
	}

	@Transactional(readOnly=true)
	public Page<GenScheme> findAll(SpecificationDetail<GenScheme> spec, PageModel<GenScheme> pm) {
		return genSchemeRepository.findAll(spec, pm);
	}


	public List<GenScheme> findAll(String id) {
		return genSchemeRepository.findAll(DynamicSpecifications.bySearchQueryCondition(QueryCondition.eq(GenTable.F_STATUS, GenTable.FLAG_NORMAL), 
				QueryCondition.ne(GenTable.F_ID, id == null ? "-1" : id)));
	}


	public String generateCode(GenScheme genScheme) {
		StringBuilder result = new StringBuilder();

		// 查询主表及字段列
		GenTable genTable = genTableRepository.findOne(genScheme.getGenTable().getId());

		// 获取所有代码模板
		GenConfig config = GenUtil.getConfig();

		// 获取模板列表
		List<GenTemplate> templateList = GenUtil.getTemplateList(config, genScheme.getCategory(), false);
		List<GenTemplate> childTableTemplateList = GenUtil.getTemplateList(config, genScheme.getCategory(), true);

		// 如果有子表模板，则需要获取子表列表
		if (childTableTemplateList.size() > 0) {
			genTable.getChildList();
		}

		// 生成子表模板代码
		for (GenTable childTable : genTable.getChildList()) {
			childTable.setCategory(genScheme.getCategory());
			genScheme.setGenTable(childTable);
			Map<String, Object> childTableModel = GenUtil.getDataModel(genScheme);
			for (GenTemplate tpl : childTableTemplateList) {
				result.append(GenUtil.generateToFile(tpl, childTableModel, genScheme.getReplaceFile()));
			}
		}
		genTable.setCategory(genScheme.getCategory());
		// 生成主表模板代码
		genScheme.setGenTable(genTable);
		Map<String, Object> model = GenUtil.getDataModel(genScheme);
		for (GenTemplate tpl : templateList) {
			result.append(GenUtil.generateToFile(tpl, model, genScheme.getReplaceFile()));
		}
		return result.toString();
	}

}
